var data = {
    "1.901-2.890": "Hi!",
    "5.901-6.890": "Hello",
    "6.901-7.890": "world.",
    "7.901-8.890": "Как дела?",
    "9.901-10.890": "Хорошо",
}

document.getElementById("select-json-button").addEventListener("click", function() {
    document.getElementById("json-file").click();
});

function readJSONFile(callback) {
    var input = document.getElementById('json-file');
    input.addEventListener('input', handleFileSelect);

    function handleFileSelect() {
        var file = input.files[0];
        input.value = null;

        var reader = new FileReader();
        reader.onload = function() {
            var jsonData = JSON.parse(reader.result);
            callback(jsonData);
        };
        reader.readAsText(file);
    }
}

readJSONFile(function(jsonData) {
    data = jsonData;
    updateLeftSide(data);
    updateLocalStorage();
    console.log(data);
});

const selectFileButton = document.getElementById("select-audio-button");
const audioPlayer = document.getElementById("audioPlayer");

// Add an event listener to the button to trigger the file selection dialog
selectFileButton.addEventListener("click", function() {
  const fileInput = document.getElementById("audio-file");
  fileInput.addEventListener("change", function() {
    const track = this.files[0];
    audioPlayer.src = URL.createObjectURL(track);
    audioPlayer.play();

    document.getElementById('track-name').value = track.name;
    updateLocalStorage();
  });
  fileInput.click();
});

function updateLocalStorage() {
    // Save the data and times from the right side to local storage
    var track_name = document.getElementById('track-name').value;
    var timesElement = document.getElementById('times-list');

    var times_list = [];
    for (var i = 0; i < timesElement.children.length; i++) {
        times_list.push(timesElement.children[i].textContent);
    }

    localStorage.setItem('data', JSON.stringify(data));
    localStorage.setItem('times', JSON.stringify(times_list));
    localStorage.setItem('track-name', track_name);
}

function updateLeftSide(data) {
 // Clear the right side
    document.getElementById('times-list').innerHTML = '';
    document.getElementById('words').innerHTML = '';
    var startTime = null;
    var text_to_add = '<div class="row">\n';
    var words_div = '<div class="row-words">\n';
    
    var full_words_html = ''

    for (var time in data) {
        var word = data[time];
        if (startTime === null) {
            startTime = time.split("-")[0];
        }
        var endTime = time.split("-")[1];
        words_div += '<div class="word" id="' + time + '">' + word + '</div>\n';
        if (true) {
        // if (word.endsWith(".") || word.endsWith("?") || word.endsWith("!")) {
            words_div += '</div>\n';

            text_to_add += '<div class="time-switcher-container">\n'
            text_to_add += '<div class="start-time">' + startTime + '</div>' 
            text_to_add += '<div class="switcher"> ¶ </div>' 
            text_to_add += '</div>'

            text_to_add += words_div;
            text_to_add += '</div>\n';

            full_words_html += text_to_add;

            text_to_add = '<div class="row">\n';
            words_div = '<div class="row-words">\n';
            startTime = null;
        }
    }
    if (words_div !== '<div class="row-words">\n') {
        words_div += '</div>\n';
        text_to_add += '<div class="start-time">' + startTime + '</div>' + words_div;
        text_to_add += '</div>\n';

        full_words_html += text_to_add;
    }

    // for (var time in data) {
    //     var word = data[time];
    //     var startTime = time.split("-")[0];
    //     var endTime = time.split("-")[1];
    //     var text_to_add = '<div class="row">\n'
    //     text_to_add += '<div class="start-time">' + startTime + '</div><div class="word" id="' + time + '">' + word + '</div>\n';
    //     text_to_add += '</div>\n';
    //     full_words_html += text_to_add;
    // }

    document.getElementById("words").innerHTML += full_words_html;

    // Add event listeners to the word divs to update the right side and the word color when a word is clicked
    var wordElements = document.querySelectorAll('.word');
    for (var i = 0; i < wordElements.length; i++) {
        wordElements[i].addEventListener('click', (function() {
            // When a word is clicked, get the time of the word
            var time = this.id;
            // Update the right side with the corresponding time
            updateRightSide(time);
            // Update the color of the word based on whether its timestamp is in the right side
            var timeExists = document.getElementById('times-list').innerHTML.includes(time);
            if (timeExists) {
                this.classList.add('grey');
            } else {
                this.classList.remove('grey');
            }

            updateLocalStorage();
        }));
    }

    // Add event listeners to the start-time divs to play audio when clicked
    var startTimeElements = document.querySelectorAll('.start-time');
    for (var i = 0; i < startTimeElements.length; i++) {
        startTimeElements[i].addEventListener('click', (function() {
            var start_time = Number(this.innerHTML);
            audioPlayer.currentTime = start_time;
            audioPlayer.play();
        }));
    }

    // Add event listeners to the start-time divs to play audio when clicked
    document.querySelectorAll('.switcher').forEach(function(switcher) {
    switcher.addEventListener('click', function() {
          var words = this.parentElement.nextElementSibling.querySelectorAll('.word');
          words.forEach(function(word) {
              word.classList.toggle('grey');
              var time = word.id;
              // Update the right side with the corresponding time
              updateRightSide(time);
              // Update the color of the word based on whether its timestamp is in the right side
              var timeExists = document.getElementById('times-list').innerHTML.includes(time);
              if (timeExists) {
                  word.classList.add('grey');
              } else {
                  word.classList.remove('grey');
              }

              updateLocalStorage();
          });
      });
    });

}

function updateRightSide(time) {
    var timesList = document.getElementById('times-list');
    // Check if the time is already in the list
    var timeExists = timesList.innerHTML.includes(time);
    if (!timeExists) {
        // If the time is not in the list, add it
        timesList.innerHTML += '<div>' + time + '</div>';
    } else {
        // If the time is in the list, remove it
        timesList.innerHTML = timesList.innerHTML.replace('<div>' + time + '</div>', '');
    }
}

function processJSON() {
    var jsonInput = document.getElementById('json-input').value;
    if (jsonInput !== '') {
        try {
            var newData = JSON.parse(jsonInput);
            data = newData;
            updateLeftSide(data);
        } catch (error) {
            alert('Invalid JSON');
        }
    }

}
document.getElementById('process-json').addEventListener('click', processJSON);

function excludeIntervals(intervals, fullLength) {
    // Split intervals into start and end times
    intervals = intervals.map(i => i.split('-').map(Number));
    // Sort intervals by start time
    intervals.sort((a, b) => a[0] - b[0]);
    // Initialize result array
    let result = [];
    // Initialize start time
    let start = 0;
    // Iterate through intervals
    for (let i = 0; i < intervals.length; i++) {
        // Compare start time to interval start time
        if (start < intervals[i][0]) {
            // If start time is less than interval start time, push start time to interval start time
            result.push(start + '-' + intervals[i][0]);
        }
        // Update start time to interval end time
        start = intervals[i][1];
    }
    // Compare start time to full length
    if (start < fullLength) {
        // If start time is less than full length, push start time to full length
        result.push(start + '-' + fullLength);
    }
    return result;
}

function mergeIntervals(intervals, threshold) {
    // Split intervals into start and end times
    intervals = intervals.map(i => i.split('-').map(Number));
    // Sort intervals by start time
    intervals.sort((a, b) => a[0] - b[0]);
    // Initialize result array
    let result = [];
    // Initialize start and end times
    let start = intervals[0][0],
        end = intervals[0][1];
    // Iterate through intervals
    for (let i = 1; i < intervals.length; i++) {
        // Compare end time to interval start time
        if (end + threshold >= intervals[i][0]) {
            // If end time + threshold is greater than or equal to interval start time, update end time
            end = Math.max(end, intervals[i][1]);
        } else {
            // Else push current interval and update start and end times
            result.push(start + '-' + end);
            start = intervals[i][0];
            end = intervals[i][1];
        }
    }
    // Push final interval
    result.push(start + '-' + end);
    return result;
}

function getRealIntervals(source_times, threshold, fullLength) {
    var merged_intervals = mergeIntervals(source_times, threshold);
    var excluded_intervals = excludeIntervals(merged_intervals, fullLength);

    return excluded_intervals;
}

function generateAssetsText(times_intervals) {
    var offset = 0;
    var assets_text = "";
    times_intervals.forEach(function(timeInterval, index) {
        var parts = timeInterval.split("-");
        var start = parseFloat(parts[0]);
        var end = parseFloat(parts[1]);
        var duration = end - start;
        assets_text += `\t\t\t\t\t<asset-clip name="Voice" ref="r2" offset="${start}s" start="${start}s" duration="${duration}s" audioRole="dialogue"/>\n`;
        offset += duration;
    });
    return assets_text;
}

function makeTestToXML(times_intervals, full_length, track_name) {
    // Create an XML string with the times_intervals
    track_name = encodeURIComponent(track_name);
    assets_text = generateAssetsText(times_intervals);

    xml_text = '';
    xml_text += '<fcpxml version="1.10">\n\n';

    xml_text += '<!-- Resources -->\n';
    xml_text += '\t<resources>\n';
    xml_text += '\t\t<format id="r1" name="FFFrameRateUndefined"/>\n';
    xml_text += `\t\t<asset id="r2" start="0s" duration="${full_length}s" hasAudio="1" format="r1" audioSources="1" audioChannels="2" audioRate="48000">\n`
    xml_text += `\t\t\t<media-rep kind="original-media" src="./${track_name}"/>\n`
    xml_text += '\t\t</asset>\n'
    xml_text += '\t</resources>\n\n'

    xml_text += '<!-- Events -->\n'
    xml_text += '\t<event name="TK_BigEvent">\n'
    xml_text += '\t\t<project name="TK_Project">\n'
    xml_text += '\t\t\t<!-- Project Story Elements -->\n'
    xml_text += '\t\t\t<sequence format="r1">\n'
    xml_text += '\t\t\t\t<spine>\n'

    xml_text += assets_text

    xml_text += '\t\t\t\t</spine>\n'
    xml_text += '\t\t\t</sequence>\n'
    xml_text += '\t\t</project>\n\n'

    xml_text += '<!-- Clips -->\n'
    xml_text += `\t\t<asset-clip name="Voice" ref="r2" format="r1" start="0s" duration="${full_length}s" audioRole="dialogue"/>\n`
    xml_text += '\t</event>\n\n'

    xml_text += '</fcpxml>\n'
    return xml_text
}

function getMaxEndTime(texts_dict) {
    var maxEndTime = 0;
    for (var key in texts_dict) {
        var parts = key.split("-");
        var end = parseFloat(parts[1]);
        if (end > maxEndTime) {
            maxEndTime = end;
        }
    }
    return maxEndTime;
}

function makeNameFCPXML(track_name) {
    var parts = track_name.split(".");
    var newName = parts.slice(0, -1).join(".") + ".fcpxml";
    return newName;
}

function exportXML() {
    updateLocalStorage();

    var texts_dict = JSON.parse(localStorage.getItem('data'));
    var full_length = getMaxEndTime(texts_dict) + 15;

    var source_times = JSON.parse(localStorage.getItem('times'));
    var times_intervals = getRealIntervals(source_times, 0.8, full_length);

    var track_name = document.getElementById('track-name').value;
    xml_text = makeTestToXML(times_intervals, full_length, track_name)

    // Create a Blob with the XML string and the correct MIME type
    var blob = new Blob([xml_text], {
        type: 'text/xml'
    });
    // Create a URL for the Blob
    var url = URL.createObjectURL(blob);
    // Create a link element
    var link = document.createElement('a');
    // Set the link element's href and download attributes
    link.href = url;

    var save_name = makeNameFCPXML(track_name);
    link.download = save_name;

    // Append the link element to the body
    document.body.appendChild(link);
    // Click the link element to trigger the download
    link.click();
    // Remove the link element
    document.body.removeChild(link);
    // Revoke the URL
    URL.revokeObjectURL(url);
}
document.getElementById('save-xml').addEventListener('click', exportXML);

window.addEventListener('load', function() {
    // Initialize the left side with the default data
    var newData = JSON.parse(localStorage.getItem('data'));
    if (newData) {
        data = newData;
    }

    updateLeftSide(data);

    var times = JSON.parse(localStorage.getItem('times'));
    if (times) {
        for (var i = 0; i < times.length; i++) {
            updateRightSide(times[i]);
            var wordElement = document.getElementById(times[i]);
            if (wordElement) {
                wordElement.classList.add('grey');
            }
        }
    }

    var track_name = localStorage.getItem('track-name');
    document.getElementById('track-name').value = track_name;
});

const dropZone = document.getElementById("drop_zone");

// Add event listeners to the window to detect when a file is being dragged over it
window.addEventListener("dragover", dragOverHandler);
window.addEventListener("drop", dropHandler);

function dropHandler(ev) {
  console.log('File(s) dropped');

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  const file = event.dataTransfer.files[0];
  console.log(file.name);

  if (file.type === "application/json") {
    console.log(file.name);
    var reader = new FileReader();

    reader.onload = function() {
        console.log('json');
        var jsonData = JSON.parse(reader.result);

        data = jsonData;
        updateLeftSide(data);
        updateLocalStorage();
        console.log(data);
    };
    reader.readAsText(file);

  } else if (file.type.startsWith("audio")) {
        console.log('audio');
        console.log(file.name);

        audioPlayer.src = URL.createObjectURL(file);
        audioPlayer.play();

        document.getElementById('track-name').value = file.name;
        updateLocalStorage();
  }

  dropZone.style.display = "none";
}

function dragOverHandler(ev) {
  // console.log('File(s) in drop zone');
  dropZone.style.display = "block";
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}
