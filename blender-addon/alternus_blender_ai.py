bl_info = {
    "name": "Alternus Blender AI",
    "author": "Alternus",
    "version": (0, 1, 0),
    "blender": (3, 6, 0),
    "location": "View3D > Sidebar > Alternus AI",
    "description": "Generate Blender scenes from prompts through the Alternus API.",
    "category": "3D View",
}

import json
import traceback
import urllib.error
import urllib.request

import bpy
from bpy.props import BoolProperty, StringProperty


DEFAULT_API_URL = "https://www.alternusart.com/api/blender/chat"


class AlternusBlenderAISettings(bpy.types.PropertyGroup):
    api_url: StringProperty(
        name="API URL",
        default=DEFAULT_API_URL,
        description="Alternus Blender chat endpoint",
    )
    api_token: StringProperty(
        name="API Token",
        default="",
        subtype="PASSWORD",
        description="Optional token matching BLENDER_ADDON_TOKEN on the server",
    )
    prompt: StringProperty(
        name="Prompt",
        default="Create a modern gallery room with white walls, wooden floor, spotlights, and three sculptures",
        description="Describe the 3D scene to generate",
    )
    status: StringProperty(
        name="Status",
        default="Ready",
    )
    last_summary: StringProperty(
        name="Last Summary",
        default="",
    )
    auto_execute: BoolProperty(
        name="Run Script",
        default=True,
        description="Execute the generated Blender Python script immediately",
    )


def append_chat_line(context, text):
    settings = context.scene.alternus_blender_ai
    current = settings.last_summary.strip()
    settings.last_summary = f"{current}\n{text}".strip()[-1800:]


def call_alternus_api(settings):
    payload = json.dumps({"prompt": settings.prompt}).encode("utf-8")
    request = urllib.request.Request(
        settings.api_url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "AlternusBlenderAI/0.1",
        },
        method="POST",
    )
    if settings.api_token.strip():
        request.add_header("Authorization", f"Bearer {settings.api_token.strip()}")
        request.add_header("X-Alternus-Blender-Token", settings.api_token.strip())

    with urllib.request.urlopen(request, timeout=60) as response:
        raw = response.read().decode("utf-8")
        return json.loads(raw)


class ALTERNUS_OT_generate_scene(bpy.types.Operator):
    bl_idname = "alternus.generate_scene"
    bl_label = "Generate 3D Scene"
    bl_description = "Send the prompt to Alternus and generate the returned Blender scene"

    def execute(self, context):
        settings = context.scene.alternus_blender_ai
        prompt = settings.prompt.strip()
        if not prompt:
            settings.status = "Write a prompt first."
            self.report({"WARNING"}, settings.status)
            return {"CANCELLED"}

        settings.status = "Sending prompt..."
        append_chat_line(context, f"User: {prompt}")

        try:
            result = call_alternus_api(settings)
            script = result.get("script")
            summary = result.get("summary", "Scene generated.")
            if not script:
                raise ValueError("API response did not include a script.")

            if settings.auto_execute:
                namespace = {
                    "__name__": "__alternus_blender_ai__",
                    "bpy": bpy,
                }
                exec(script, namespace)
                settings.status = "Scene generated in Blender."
            else:
                text = bpy.data.texts.new("alternus_generated_scene.py")
                text.write(script)
                settings.status = "Script added to Blender Text editor."

            append_chat_line(context, f"Alternus: {summary}")
            self.report({"INFO"}, settings.status)
            return {"FINISHED"}
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            settings.status = f"API error {error.code}"
            append_chat_line(context, f"Error: {detail[:400]}")
            self.report({"ERROR"}, settings.status)
        except Exception as error:
            settings.status = "Generation failed."
            append_chat_line(context, f"Error: {error}")
            print(traceback.format_exc())
            self.report({"ERROR"}, str(error))

        return {"CANCELLED"}


class ALTERNUS_OT_clear_chat(bpy.types.Operator):
    bl_idname = "alternus.clear_chat"
    bl_label = "Clear Chat"
    bl_description = "Clear the Alternus chat log"

    def execute(self, context):
        context.scene.alternus_blender_ai.last_summary = ""
        context.scene.alternus_blender_ai.status = "Ready"
        return {"FINISHED"}


class ALTERNUS_PT_blender_ai_panel(bpy.types.Panel):
    bl_label = "Alternus AI"
    bl_idname = "ALTERNUS_PT_blender_ai_panel"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Alternus AI"

    def draw(self, context):
        layout = self.layout
        settings = context.scene.alternus_blender_ai

        layout.prop(settings, "api_url")
        layout.prop(settings, "api_token")
        layout.separator()
        layout.prop(settings, "prompt", text="Prompt")
        layout.prop(settings, "auto_execute")

        row = layout.row(align=True)
        row.operator("alternus.generate_scene", icon="PLAY")
        row.operator("alternus.clear_chat", icon="TRASH", text="")

        layout.separator()
        layout.label(text=f"Status: {settings.status}")

        box = layout.box()
        box.label(text="Chat")
        if settings.last_summary.strip():
            for line in settings.last_summary.splitlines()[-10:]:
                box.label(text=line[:95])
        else:
            box.label(text="No messages yet.")


classes = (
    AlternusBlenderAISettings,
    ALTERNUS_OT_generate_scene,
    ALTERNUS_OT_clear_chat,
    ALTERNUS_PT_blender_ai_panel,
)


def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.alternus_blender_ai = bpy.props.PointerProperty(type=AlternusBlenderAISettings)


def unregister():
    del bpy.types.Scene.alternus_blender_ai
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)


if __name__ == "__main__":
    register()
