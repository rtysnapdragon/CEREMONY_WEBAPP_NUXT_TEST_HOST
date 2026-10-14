export const rtydate = (date: Date = new Date()) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  // Handle invalid date
  if (isNaN(date.getTime())) {
    console.log("Invalid date passed:", date);
    return {
      date: new Date(),
      format: (formatString: string = 'MMMM dd, yyyy') => {
        return 'Invalid Date';
      }
    };
  }

  // Full names of days of the week
  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthFullNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const tokens: Record<string, string> = {
    yyyy: String(date.getFullYear()), // Full year (e.g., 2025)
    yy: String(date.getFullYear()).slice(-2), // Last two digits of year (e.g., 25 for 2025)
    dddd: dayNames[date.getDay()], // Full weekday name (e.g., 'Monday')
    MMMM: monthFullNames[date.getMonth()], // Full month name (e.g., 'January')
    MMM: monthNames[date.getMonth()], // Abbreviated month name (e.g., 'Jan')
    MM: String(date.getMonth() + 1).padStart(2, '0'), // Month number (2-digit, e.g., '01')
    M: String(date.getMonth() + 1), // Month number (single digit)
    dd: String(date.getDate()).padStart(2, '0'), // Day number (2-digit, e.g., '09')
    d: String(date.getDate()), // Day number (single digit)
    hh: String(date.getHours() % 12 || 12).padStart(2, '0'), // 12-hour format hour (2-digit)
    h: String(date.getHours() % 12 || 12), // 12-hour format hour (single digit)
    HH: String(date.getHours()).padStart(2, '0'), // 24-hour format hour (2-digit)
    H: String(date.getHours()), // 24-hour format hour (single digit)
    mm: String(date.getMinutes()).padStart(2, '0'), // Minutes (2-digit)
    m: String(date.getMinutes()), // Minutes (single digit)
    ss: String(date.getSeconds()).padStart(2, '0'), // Seconds (2-digit)
    s: String(date.getSeconds()), // Seconds (single digit)
    a: date.getHours() < 12 ? 'am' : 'pm', // AM/PM (lowercase)
    A: date.getHours() < 12 ? 'AM' : 'PM' // AM/PM (uppercase)
  };

  return {
    date,
    format(formatString: string = 'MMMM dd, yyyy'): string {
      return formatString.replace(
        /yyyy|yy|dddd|MMMM|MMM|MM|M|dd|d|hh|h|HH|H|mm|m|ss|s|a|A/g,
        (match) => tokens[match] || match
      );
    }
  };
};

  
// import { useI18n } from 'vue-i18n';

// export const rtydate = (date: Date = new Date()) => {
//   const { t, locale } = useI18n(); // Get the translation function and current locale
  
//   // Ensure the date is a Date object
//   if (!(date instanceof Date)) {
//     date = new Date(date);
//   }
  
//   // Handle invalid date
//   if (isNaN(date.getTime())) {
//     console.log("Invalid date passed:", date);
//     return {
//       date: new Date(),
//       format: (formatString: string = 'MMMM dd, yyyy') => {
//         return 'Invalid Date';
//       }
//     };
//   }

//   // Fetch translated day names, month names, and Khmer calendar details
//   const dayNames = t('days_') || [];  // Fallback to an empty array if undefined
//   const monthNames = t('months_') || [];  // Fallback to an empty array if undefined
//   const khmerMonths = t('khmer.months_') || [];  // Khmer months with fallback
//   const khmerYearLabel = t('khmer.year') || 'Khmer Year';  // Fallback for Khmer year label
//   const khmerDayLabel = t('khmer.day') || 'Day';  // Fallback for Khmer day label
  
//   // Check if the month and day arrays are valid
//   const monthIndex = date.getMonth();
//   const dayIndex = date.getDay();

//   // // Check that dayNames and monthNames are valid arrays
//   // if (!Array.isArray(dayNames) || !Array.isArray(monthNames)) {
//   //   console.log('Invalid dayNames or monthNames arrays', { dayNames, monthNames });
//   //   return {
//   //     date: new Date(),
//   //     format: (formatString: string = 'MMMM dd, yyyy') => {
//   //       return 'Invalid Date';
//   //     }
//   //   };
//   // }

//   // Ensure the indices are within range
//   const validMonthName = monthNames[monthIndex] || 'Invalid Month';
//   const validDayName = dayNames[dayIndex] || 'Invalid Day';

//   const khmerYear = date.getFullYear() + 543; // Khmer year conversion
//   const khmerDay = date.getDate(); // Day in Khmer lunar calendar (simplified)

//   // Function to calculate Khmer lunar month (simplified)
//   const getKhmerLunarMonth = (monthIndex: number) => khmerMonths[monthIndex] || 'Unknown';

//   return {
//     date,
//     format(formatString: string = 'MMMM dd, yyyy'): string {
//       const tokens: Record<string, string> = {
//         yyyy: String(date.getFullYear()), // Gregorian year
//         yy: String(date.getFullYear()).slice(-2), // Last two digits of the year
//         dddd: validDayName, // Full weekday name
//         MMMM: validMonthName, // Full month name
//         MMM: validMonthName.slice(0, 3), // Short month name
//         MM: String(monthIndex + 1).padStart(2, '0'), // Month number (2-digit)
//         M: String(monthIndex + 1), // Month number (single digit)
//         dd: String(date.getDate()).padStart(2, '0'), // Day number (2-digit)
//         d: String(date.getDate()), // Day number (single digit)
//         HH: String(date.getHours()).padStart(2, '0'), // Hour (24-hour format)
//         mm: String(date.getMinutes()).padStart(2, '0'), // Minutes (2-digit)
//         ss: String(date.getSeconds()).padStart(2, '0'), // Seconds (2-digit)
//         khmerYear: String(khmerYear), // Khmer year
//         khmerMonth: getKhmerLunarMonth(monthIndex), // Khmer month (simplified)
//         khmerDay: String(khmerDay), // Khmer day (simplified)
//         khmerYearLabel, // Khmer Year label
//         khmerDayLabel, // Khmer Day label
//       };

//       return formatString.replace(
//         /yyyy|yy|dddd|MMMM|MMM|MM|M|dd|d|HH|mm|ss|khmerYear|khmerMonth|khmerDay|khmerYearLabel|khmerDayLabel/g,
//         (match) => tokens[match] || match
//       );
//     }
//   };
// };



//   Useage : 
//   <script setup>
//   // No import needed!
//   const now = rtydate().format('MMM dd, yyyy hh:mm A')
//   const specificDate = rtydate(new Date('2025-04-05T10:55:00')).format('MMM dd, yyyy')
//   </script>
  
//   <template>
//     <div>
//       <p>Now: {{ rtydate().format('MMM dd, yyyy hh:mm A') }}</p>
//       <p>Specific date: {{ specificDate }}</p>
//     </div>
//   </template>


// const formattedDateEn = rtydate(new Date('2025-04-06')).format('dddd, MMMM dd, yyyy (khmerYearLabel: khmerYear, khmerMonth: khmerMonth, khmerDayLabel: khmerDay)');
// console.log(formattedDateEn);
// // Output (in English): "Sunday, April 06, 2025 (Khmer Year: 2568, Month: April, Day: 06)"

// const formattedDateKm = rtydate(new Date('2025-04-06')).format('dddd, MMMM dd, yyyy (khmerYearLabel: khmerYear, khmerMonth: khmerMonth, khmerDayLabel: khmerDay)');
// console.log(formattedDateKm);
// // Output (in Khmer): "ថ្ងៃអាទិត្យ, មេសា 06, 2025 (ឆ្នាំខ្មែរ: 2568, ខែ: មេសា, ថ្ងៃ: 06)"


// const date = new Date();
// const formattedDate = rtydate(date).format('dddd, MMMM dd, yyyy');
// console.log(formattedDate); // Output will depend on the current locale (either Khmer or English).
