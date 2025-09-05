export type Museum = {
    id: string;
    name: string;
    location: string;
    hero: string; // background image
    description: string;
    align?: 'left' | 'right';
    categories: { id: string; name: string; image: string; blurb?: string; align?: 'left' | 'right' }[];
};

export const MUSEUMS: Museum[] = [
    {
        id: 'nat-history',
        name: 'Museum Sejarah Alam Nusantara',
        location: 'Bogor, Jawa Barat',
        hero: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?q=80&w=1200&auto=format&fit=crop',
        description: 'Eksplor kekayaan biodiversitas Indonesia: fosil, diorama ekosistem, hingga spesimen langka yang menceritakan evolusi nusantara.',
        categories: [
            { id: 'flora', name: 'Flora Tropis', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=800&auto=format&fit=crop', blurb: 'Koleksi spesimen botani dan konservasi.', align: 'left' },
            { id: 'fauna', name: 'Fauna Endemik', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=800&auto=format&fit=crop', blurb: 'Mamalia, reptil, burung dan invertebrata penting.', align: 'right' },
            { id: 'geologi', name: 'Geologi & Fosil', image: 'https://indonesiakaya.com/wp-content/uploads/2020/10/1110_Beberapa-jenis-fosil-hewan-purbakala-yang-pernah-hidup-di-Indonesia.jpg', blurb: 'Stratigrafi, mineral, rekonstruksi prasejarah.', align: 'left' }
        ]
    },
    {
        id: 'maritim',
        name: 'Museum Maritim Nusantara',
        location: 'Surabaya, Jawa Timur',
        hero: 'https://images.unsplash.com/photo-1504607798333-52a30db54a5d?q=80&w=1200&auto=format&fit=crop',
        description: 'Jejak kejayaan pelaut dan perdagangan rempah melalui replika kapal, peta kuno, dan artefak pelayaran.',
        categories: [
            { id: 'kapal', name: 'Replika Kapal', image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=800&auto=format&fit=crop', blurb: 'Perahu tradisional, jung, hingga kapal VOC.', align: 'left' },
            { id: 'navigasi', name: 'Navigasi', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=800&auto=format&fit=crop', blurb: 'Instrumen arah dan peta ekspedisi.', align: 'right' },
            { id: 'rempah', name: 'Perdagangan Rempah', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgIs8dPlFmIrDMQHw8czbUHXptDSjSUspK4Q&s', blurb: 'Komoditas yang mengubah peta dunia.', align: 'left' }
        ]
    },
    {
        id: 'budaya',
        name: 'Museum Budaya & Etnografi',
        location: 'Denpasar, Bali',
        hero: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=1200&auto=format&fit=crop',
        description: 'Menelusuri ragam busana adat, ritual, musik tradisional, dan artefak yang membentuk identitas budaya.',
        categories: [
            { id: 'pakaian', name: 'Busana Adat', image: 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=800&auto=format&fit=crop', align: 'left' },
            { id: 'musik', name: 'Instrumen Musik', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAI7sNqIAeo8w1KiOG_BKYUtSwM1bvyvaU-Q&s', align: 'right' },
            { id: 'ritual', name: 'Ritual & Kepercayaan', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop', align: 'left' }
        ]
    }
];
