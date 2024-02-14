let rainfallData = [];
let chart;

// Load data from local storage on page load
window.onload = function () {
    const storedData = localStorage.getItem('rainfallData');
    if (storedData) {
        rainfallData = JSON.parse(storedData);
        updateHistory();
        updateChart();
    }
};
// Function to check for abnormal rainfall and trigger an alert
function checkRainfallAlert() {
    const threshold = 50; // Set your predefined rainfall threshold here (in mm)

    // Check if the latest rainfall data exceeds the threshold
    if (rainfallData.length > 0 && rainfallData[rainfallData.length - 1].rainfall > threshold) {
        // Trigger an alert
        alert(`Abnormal rainfall detected! Rainfall value: ${rainfallData[rainfallData.length - 1].rainfall} mm`);
    }
}
function addRainfall() {
    const input = document.getElementById('rainfallInput');
    const municipalityInput = document.getElementById('municipalityInput');

    const rainfallValue = parseFloat(input.value);

    if (!isNaN(rainfallValue)) {
        const currentDate = new Date();
        const dateString = currentDate.toLocaleDateString();

        // Check if it's a new day
        if (rainfallData.length > 0 && rainfallData[rainfallData.length - 1].date !== dateString) {
            // If it's a new day, reset the rainfallData array
            rainfallData = [];
        }

        const newData = {
            date: dateString,
            rainfall: rainfallValue,
            municipality: municipalityInput.value
        };

        rainfallData.push(newData);
        input.value = '';
        municipalityInput.value = '';

        // Save data to local storage
        localStorage.setItem('rainfallData', JSON.stringify(rainfallData));

        updateHistory();
        updateChart();

        // Check for rainfall alert after updating data
        checkRainfallAlert(newData);
    } else {
        alert('Please enter a valid rainfall value.');
    }
}

// Modify the checkRainfallAlert function to add the appropriate class to the alert container
function checkRainfallAlert(newData) {
    const category = getCategoryLabel(newData.rainfall);
    const message = `Rainfall in ${newData.municipality}: ${newData.rainfall} mm (${category})`;

    // Create a temporary element to display the message
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert-container ${getCategoryClass(category)}`;
    alertContainer.textContent = message;

    // Append the element to the body
    document.body.appendChild(alertContainer);
    
    // Remove the element after a certain duration (e.g., 5 seconds)
    setTimeout(() => {
        document.body.removeChild(alertContainer);
    }, 5000); // 5000 milliseconds = 5 seconds
}


// Add this function to get the appropriate class based on the rainfall category
function getCategoryClass(category) {
    const classMap = {
        'No Rain': 'no-rain',
        'Weak Rain': 'weak-rain',
        'Moderate Rain': 'moderate-rain',
        'Heavy Rain': 'heavy-rain',
        'Shower': 'shower',
        'Cloud Burst': 'cloud-burst'
    };

    return classMap[category] || '';
}

// Modify the getCategoryLabel function to return the category label
function getCategoryLabel(rainfall) {
    if (rainfall < 0.5) {
        return 'No Rain';
    } else if (rainfall >= 0.5 && rainfall < 2) {
        return 'Weak Rain';
    } else if (rainfall >= 2 && rainfall < 6) {
        return 'Moderate Rain';
    } else if (rainfall >= 10 && rainfall < 18) {
        return 'Heavy Rain';
    } else if (rainfall >= 18 && rainfall <= 30) {
        return 'Shower';
    } else {
        return 'Cloud Burst';
    }
}


function removeLastData() {
    if (rainfallData.length > 0) {
        rainfallData.pop(); // Remove the last element
        localStorage.setItem('rainfallData', JSON.stringify(rainfallData));
        updateHistory();
        updateChart();
    } else {
        alert('No data to remove.');
    }
}
// Call the checkRainfallAlert function on page load
window.onload = function () {
    const storedData = localStorage.getItem('rainfallData');
    if (storedData) {
        rainfallData = JSON.parse(storedData);
        updateHistory();
        updateChart();

        // Check for rainfall alert on page load
        checkRainfallAlert();
    }
};

function updateHistory() {
    const historyTable = document.getElementById('historyTable');
    const dateSelector = document.getElementById('dateSelectorHistory');

    // Get the selected date
    const selectedDate = new Date(dateSelector.value);
    const selectedDateString = selectedDate.toLocaleDateString();

    // Filter data based on the selected date
    const filteredData = rainfallData.filter(data => data.date === selectedDateString);

    historyTable.innerHTML = '';

    filteredData.forEach(data => {
        const row = historyTable.insertRow();
        const dateCell = row.insertCell(0);
        const rainfallCell = row.insertCell(1);
        const municipalityCell = row.insertCell(2);
        const categoryCell = row.insertCell(3); // New column for category

        dateCell.textContent = data.date;
        rainfallCell.textContent = data.rainfall;
        municipalityCell.textContent = data.municipality;

        // Determine category and set text content for the category cell
        const category = getCategoryLabel(data.rainfall);
        categoryCell.textContent = category;
    });
}

function getCategoryLabel(rainfallValue) {
    if (rainfallValue < 0.5) {
        return 'No Rain';
    } else if (rainfallValue >= 0.5 && rainfallValue < 2) {
        return 'Weak Rain';
    } else if (rainfallValue >= 2 && rainfallValue <= 6) {
        return 'Moderate Rain';
    } else if (rainfallValue > 6 && rainfallValue <= 18) {
        return 'Heavy Rain';
    } else if (rainfallValue > 18 && rainfallValue <= 30) {
        return 'Shower';
    } else {
        return 'Cloud Burst';
    }
}

function updateChart() {
    // Get the canvas element
    const ctx = document.getElementById('rainfallChart').getContext('2d');

    // If a chart instance exists, destroy it to update with new data
    if (chart) {
        chart.destroy();
    }

    // Create a new Chart.js line chart
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: rainfallData.map(data => `${data.date} - ${data.municipality}`),
            datasets: [{
                label: 'Rainfall (mm)',
                backgroundColor: getColorsForDataset(rainfallData),
                data: rainfallData.map(data => data.rainfall),
                fill: true
            }]
        },
        options: {
            scales: {
                x: [{
                    type: 'linear',
                    position: 'bottom'
                }],
                y: {
                    min: 0,
                    max: 40 // Adjust the max value as needed
                }
            }
        }
    });

    // Show the chart after it's created
    const chartContainer = document.getElementById('chartContainer');
    chartContainer.classList.remove('hidden');
}

function getColorsForDataset(data) {
    return data.map(item => getCategoryColor(item.rainfall));
}

function getCategoryColor(rainfallValue) {
    if (rainfallValue < 0.5) {
        return 'rgba(0, 128, 0, 0.5)';
    } else if (rainfallValue >= 0.5 && rainfallValue < 2) {
        return 'rgba(255, 255, 0, 0.5)';
    } else if (rainfallValue >= 2 && rainfallValue <= 6) {
        return 'rgba(255, 165, 0, 0.5)';
    } else if (rainfallValue > 6 && rainfallValue <= 18) {
        return 'rgba(255, 0, 0, 0.5)';
    } else if (rainfallValue > 18 && rainfallValue <= 30) {
        return 'rgba(128, 0, 128, 0.5)';
    } else {
        return 'rgba(0, 0, 255, 0.5)';
    }
}

function saveGraph() {
    const chartCanvas = document.getElementById('rainfallChart');
    const chartBase64 = chartCanvas.toDataURL('image/png');
    const currentDate = new Date().toLocaleDateString();

    // Save the graph image and date
    const savedGraphs = JSON.parse(localStorage.getItem('savedGraphs')) || [];
    savedGraphs.push({ date: currentDate, graph: chartBase64 });
    localStorage.setItem('savedGraphs', JSON.stringify(savedGraphs));

    // Update the Graph History section
    loadGraphHistory();
}

function loadGraphHistory() {
    const graphHistoryDateSelector = document.getElementById('graphHistoryDateSelector');
    const selectedDate = new Date(graphHistoryDateSelector.value);
    const selectedDateString = selectedDate.toLocaleDateString();

    const graphHistoryContainer = document.getElementById('graphHistoryContainer');
    graphHistoryContainer.innerHTML = '';

    const savedGraphs = JSON.parse(localStorage.getItem('savedGraphs')) || [];

    // Find the saved graph for the selected date
    const selectedGraph = savedGraphs.find(graph => graph.date === selectedDateString);

    if (selectedGraph) {
        // Display the saved graph
        const graphContainer = document.createElement('div');
        graphContainer.classList.add('graph-history-item');

        const graphTitle = document.createElement('h3');
        graphTitle.textContent = selectedGraph.date;

        const graphImage = document.createElement('img');
        graphImage.src = selectedGraph.graph;

        graphContainer.appendChild(graphTitle);
        graphContainer.appendChild(graphImage);

        graphHistoryContainer.appendChild(graphContainer);
    } else {
        // Display "No Data" if there is no saved graph for the selected date
        const noDataMessage = document.createElement('p');
        noDataMessage.textContent = 'No Data';
        graphHistoryContainer.appendChild(noDataMessage);
    }
}

function showContent(contentId) {
    const sections = ['homeContent', 'rainfallAnalyzerContent', 'historyContent', 'graphHistoryContent'];

    sections.forEach(section => {
        const element = document.getElementById(section);
        if (section === contentId) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });
}

// Update clock and date every second
function updateClockDate() {
    const clockDateElement = document.getElementById('clockDate');
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };
    const currentDateTime = new Date().toLocaleString('en-US', options);
    clockDateElement.textContent = currentDateTime;
}

// Initial call to set the clock and date
updateClockDate();

// Update clock and date every second
setInterval(updateClockDate, 1000);
// Call the checkRainfallAlert function periodically (e.g., every minute)
setInterval(checkRainfallAlert, 60000); // Check every 60 seconds
