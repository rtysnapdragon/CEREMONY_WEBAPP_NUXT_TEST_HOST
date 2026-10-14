// Mock data standing in for the real backend (see useWeddingApi.js).
// Each entry is a full template matching the shape WTemplateRenderer and
// useWeddingApi.normalizeTemplate() expect. Once the API is live, delete
// this file and let fetchTemplate()/fetchTemplateList() do the work —
// nothing in the components needs to change.

const inlineFloralSvg = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="100%"
     height="100%"
     viewBox="0 0 400 800">
  <rect width="400" height="800" fill="red"/>
</svg>
`.trim()

export const mockTemplates = [
  {
    id: 'sokha-sreymom',
    slug: 'sokha-sreymom',
    title: 'Sokha & Sreymom',
    theme: 'gold-cream',
    eventDate: '2026-12-20T16:00:00',
    cover: '',
    background: { type: 'gradient', value: null },
    sections: [
      {
        id: 'hero',
        component: 'hero',
        props: {
          groomName: 'Sokha',
          brideName: 'Sreymom',
          eventDate: '2026-12-20T16:00:00',
          km: 'សូមគោរពអញ្ជើញចូលរួមជាភ្ញៀវកិត្តិយសក្នុងពិធីមង្គលការ',
        },
      },
      {
        id: 'couple',
        component: 'couple',
        props: {
          groom: { name: 'Mr. Sokha', photo: '', parents: 'កូនប្រុសរបស់លោក ចាន់ សារ៉ា និងលោកស្រី ចាន់ ដានី' },
          bride: { name: 'Ms. Sreymom', photo: '', parents: 'កូនស្រីរបស់លោក ថន មុន្នី និងលោកស្រី ថន សុភា' },
        },
      },
      {
        id: 'schedule',
        component: 'schedule',
        props: {
          items: [
            { time: '07:00 AM', label: 'Blessing Ceremony', note: 'ពិធីសូត្រមន្ត', icon: 'ri-sun-line' },
            { time: '11:00 AM', label: 'Wedding Lunch', note: 'ភោជនាហារថ្ងៃត្រង់', icon: 'ri-restaurant-line' },
            { time: '06:00 PM', label: 'Reception', note: 'ពិធីជប់លៀង', icon: 'ri-goblet-line' },
          ],
        },
      },
      {
        id: 'location',
        component: 'location',
        props: {
          address: 'Diamond Palace, Phnom Penh',
          addressKm: 'ភូមិកន្លះ ស្រុកកន្លះ ខេត្តភ្នំពេញ',
          mapUrl: 'https://maps.google.com',
          qrCode: '',
        },
      },
      {
        id: 'gift',
        component: 'gift',
        props: {
          methods: [
            { label: 'ABA Bank', accountName: 'SOKHA / SREYMOM', accountNumber: '000 111 222', qrCode: '' },
            { label: 'ACLEDA Bank', accountName: 'SOKHA / SREYMOM', accountNumber: '111 222 333', qrCode: '' },
          ],
        },
      },
      { id: 'rsvp', component: 'rsvp', props: { slug: 'sokha-sreymom' } },
      { id: 'thanks', component: 'thanks', props: { groomName: 'Sokha', brideName: 'Sreymom' } },
    ],
  },

  {
    id: 'dara-chenda',
    slug: 'dara-chenda',
    title: 'Dara & Chenda',
    theme: 'celestial',
    eventDate: '2026-11-08T17:00:00',
    cover: '',
    // "celestial" dark theme — pair this template with a `dark` class on
    // <html>/<body> so the .dark tokens in tokens.scss take over.
    background: { type: 'particles', value: null },
    sections: [
      {
        id: 'hero',
        component: 'hero',
        props: {
          groomName: 'Dara',
          brideName: 'Chenda',
          eventDate: '2026-11-08T17:00:00',
          eyebrowText: 'Celestial Wedding',
          km: 'យើងខ្ញុំមានកិត្តិយសសូមអញ្ជើញលោកអ្នកចូលរួមជាសាក្សី',
        },
      },
      {
        id: 'story',
        component: 'story',
        props: {
          title: 'Our Story',
          chapters: [
            { year: '2019', title: 'First Met', text: 'A chance meeting at a friend’s birthday.', photo: '' },
            { year: '2022', title: 'The Proposal', text: 'Under the stars at Kep beach.', photo: '' },
            { year: '2026', title: 'The Wedding', text: 'Our forever begins.', photo: '' },
          ],
        },
      },
      {
        id: 'schedule',
        component: 'schedule',
        props: {
          items: [
            { time: '05:00 PM', label: 'Ceremony', note: 'ពិធីអាពាហ៍ពិពាហ៍', icon: 'ri-moon-line' },
            { time: '07:00 PM', label: 'Dinner & Reception', note: 'ជប់លៀងពេលល្ងាច', icon: 'ri-goblet-line' },
          ],
        },
      },
      {
        id: 'location',
        component: 'location',
        props: {
          address: 'Sokha Hotel, Phnom Penh',
          addressKm: 'សុខាហូតែល ភ្នំពេញ',
          mapUrl: 'https://maps.google.com',
          qrCode: '',
        },
      },
      { id: 'rsvp', component: 'rsvp', props: { slug: 'dara-chenda' } },
      { id: 'thanks', component: 'thanks', props: { groomName: 'Dara', brideName: 'Chenda' } },
    ],
  },

  {
    id: 'vichea-sopha',
    slug: 'vichea-sopha',
    title: 'Vichea & Sopha',
    theme: 'floral-cream',
    eventDate: '2027-01-15T16:00:00',
    cover: '',
    // demonstrates the inline-SVG background path (raw markup, not a URL)
    background: { type: 'image', value: inlineFloralSvg },
    sections: [
      {
        id: 'hero',
        component: 'hero',
        props: {
          groomName: 'Vichea',
          brideName: 'Sopha',
          eventDate: '2027-01-15T16:00:00',
          km: 'សូមអញ្ជើញចូលរួមអបអរសាទរ',
        },
      },
      {
        id: 'couple',
        component: 'couple',
        props: {
          groom: { name: 'Mr. Vichea', photo: '', parents: '' },
          bride: { name: 'Ms. Sopha', photo: '', parents: '' },
        },
      },
      {
        id: 'gift',
        component: 'gift',
        props: {
          methods: [{ label: 'Wing Bank', accountName: 'VICHEA / SOPHA', accountNumber: '098 765 432', qrCode: '' }],
        },
      },
      { id: 'rsvp', component: 'rsvp', props: { slug: 'vichea-sopha' } },
      { id: 'thanks', component: 'thanks', props: { groomName: 'Vichea', brideName: 'Sopha' } },
    ],
  },
]

// Summary rows for the gallery page (id, slug, title, eventDate, cover, theme)
export const mockTemplateList = mockTemplates.map(({ id, slug, title, eventDate, cover, theme }) => ({
  id,
  slug,
  title,
  eventDate,
  cover,
  theme,
}))

export const findMockTemplate = (slug) => mockTemplates.find((t) => t.slug === slug) || mockTemplates[0]
