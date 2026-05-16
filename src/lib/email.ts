type VerificationPayload = {
 email: string;
 code: string;
};

type OrderItem = {
 title: string;
 price: number;
 quantity: number;
};

type OrderAddress = {
 address: string;
 city: string;
 postalCode: string;
 country: string;
};

type AdminArtistApplicationPayload = {
 applicantName: string;
 applicantEmail: string;
 location: string;
 memberType: string;
 bio: string;
 artStyles: string[];
 yearsExperience: string;
 portfolioUrl?: string;
};

type AdminOrderPayload = {
 orderNumber: string;
 customerName: string;
 customerEmail: string;
 items: OrderItem[];
 total: number;
 paymentMethod: string;
 shippingAddress: OrderAddress;
};

export async function sendVerificationEmail(_email: string, _code: string) {
 return true;
}

export async function sendOrderConfirmationEmail(_payload: unknown) {
 return true;
}

export async function sendAdminNewOrderEmail(_payload: AdminOrderPayload) {
 return true;
}

export async function sendAdminNewArtistApplicationEmail(_payload: AdminArtistApplicationPayload) {
 return true;
}

export async function sendArtistApprovalEmail(_email: string, _name: string) {
 return true;
}

export async function sendArtistRejectionEmail(_email: string, _name: string, _reason: string) {
 return true;
}

export async function sendOrderShippedEmail(_payload: unknown) {
 return true;
}

export async function sendOrderDeliveredEmail(_payload: unknown) {
 return true;
}
