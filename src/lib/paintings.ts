export interface Painting {
  id: string;
  title: string;
  description: string;
  price: number;
  dimensions: string;
  medium: string;
  year: number;
  category: string; // Medium type: Painting, Photography, Sculpture, Drawing, Mixed Media
  style: string; // Artistic style: Abstract, Landscape, Portrait, Still Life, Urban, Contemporary, etc.
  image: string;
  available: boolean;
  isPreOrder?: boolean;
  preOrderReleaseDate?: string;
  preOrderDiscount?: number;
  artistId?: string;
  artist?: string;
}

export const paintings: Painting[] = [];

// Static categories for artwork types
export const categories = [
  "Painting",
  "Drawing",
  "Sculpture",
  "Photography",
  "Digital Art",
  "Mixed Media",
  "Prints",
  "Textile Art",
  "Ceramics",
  "Glass Art",
];

// Static styles for artistic styles
export const styles = [
  "Abstract",
  "Contemporary",
  "Impressionism",
  "Realism",
  "Surrealism",
  "Minimalism",
  "Expressionism",
  "Pop Art",
  "Baroque",
  "Landscape",
  "Portrait",
  "Still Life",
  "Urban",
  "Nature",
  "Figurative",
];

export function getPaintingById(id: string): Painting | undefined {
  return paintings.find((p) => p.id === id);
}

export function getPaintingsByCategory(category: string): Painting[] {
  return paintings.filter((p) => p.category === category);
}

export function getPaintingsByStyle(style: string): Painting[] {
  return paintings.filter((p) => p.style === style);
}
