// composables/useAddToCalendar.js
// Builds a Google Calendar "quick add" URL and a downloadable .ics data URI
// for the wedding date — a small but genuinely useful add for invitees.

const toUtcStamp = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

export const useAddToCalendar = () => {
  const buildCalendarLinks = ({ title, description = '', location = '', startISO, durationHours = 3 }) => {
    if (!startISO) return { googleUrl: '', icsHref: '' }
    const start = new Date(startISO)
    if (Number.isNaN(start.getTime())) return { googleUrl: '', icsHref: '' }
    const end = new Date(start.getTime() + durationHours * 3600000)

    const startStamp = toUtcStamp(start)
    const endStamp = toUtcStamp(end)

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startStamp}/${endStamp}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Invitation//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@wedding-invite`,
      `DTSTAMP:${toUtcStamp(new Date())}`,
      `DTSTART:${startStamp}`,
      `DTEND:${endStamp}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`

    return { googleUrl, icsHref }
  }

  return { buildCalendarLinks }
}
