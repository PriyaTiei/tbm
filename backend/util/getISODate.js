module.exports.getStartDate = (val) => {
    var date = val.split("T")[0]
    var time = "T00:00:00.000Z"
    return val + time
}

module.exports.getEndDate = (val) => {
    var date = val.split("T")[0]
    var time = "T23:59:00.000Z"
    return val + time
}

module.exports.getWeekDates = (d, m, y) => {
    const startDate = new Date(y, m - 1, d); // Month is 0-based in JavaScript

    // Calculate the start day of the week (Monday)
    const startDay = startDate.getDate() - (startDate.getDay() + 6) % 7;

    // Create an array to store the dates of the week
    const weekDates = [];

    // Loop through the week (7 days) and add each date to the array
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDay + i);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // Adding 1 because months are 0-based
        const day = currentDate.getDate();

        const formattedDate = `${year}-${month}-${day}`;
        weekDates.push(formattedDate); // Format as 'yyyy-mm-dd'
    }

    return weekDates;
}