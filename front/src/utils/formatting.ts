export const getFormattedDate = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('he-HE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedDate = formatter.format(date);
    return formattedDate
}

export const getFormattedTime = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('he-HE', { hour: '2-digit', minute: '2-digit' });
    const formattedTime = formatter.format(date);
    return formattedTime
}

export const getFormattedDateTime = (date: Date) => {
    return `${getFormattedDate(date)}, ${getFormattedTime(date)}`
}