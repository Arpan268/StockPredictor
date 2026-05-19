function formatDate(date) {
    const yyyy = date.getFullYear();
    let mm = String(date.getMonth() + 1).padStart(2, '0'); // Months start at 0!
    let dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
function getDateNDaysAgo(n) {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return formatDate(date);
}
export const dates = {
    startDate: getDateNDaysAgo(3),
    endDate: getDateNDaysAgo(1)
}