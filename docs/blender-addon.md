# Alternus Blender AI Add-on

This add-on adds a chatbot panel inside Blender for generating starter 3D scenes from prompts through the Alternus API.

## Files

- `blender-addon/alternus_blender_ai.py`: Blender add-on.
- `POST /api/blender/chat`: API route used by the add-on.
- `src/lib/blender-chat.ts`: local template scene generator.

## Install In Blender

1. Open Blender.
2. Go to `Edit > Preferences > Add-ons`.
3. Click `Install...`.
4. Select `blender-addon/alternus_blender_ai.py`.
5. Enable `Alternus Blender AI`.
6. Open the 3D viewport sidebar with `N`.
7. Open the `Alternus AI` tab.

## Configure

Default API URL:

```text
https://www.alternusart.com/api/blender/chat
```

For local development:

```text
http://localhost:3000/api/blender/chat
```

Optional production token:

```text
BLENDER_ADDON_TOKEN=replace-with-a-long-random-token
```

If `BLENDER_ADDON_TOKEN` is set on the server, paste the same value into the add-on `API Token` field.

## Current Behavior

The first version returns a controlled Blender Python scene script generated from local templates. It supports starter scenes such as gallery rooms, product stages, architectural massing, landscapes, rooms, and abstract compositions.

The add-on can either run the returned script immediately or place it into Blender's Text editor by disabling `Run Script`.

## Future Provider Boundary

Replace `generateBlenderSceneScript()` in `src/lib/blender-chat.ts` with a real 3D provider or LLM planner when available. Keep the API response contract:

```json
{
  "title": "Scene title",
  "summary": "Short explanation",
  "script": "Blender Python script",
  "objects": ["object names"]
}
```
