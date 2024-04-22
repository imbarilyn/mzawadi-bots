import {ref} from "vue";

export function useTextProcessor(input: string, marker: string, openTag: string, closeTag: string) {
    const markerLength = marker.length;

    // let output = '';
    const output = ref('');

    let startIndex = 0;

    while (startIndex < input.length) {
        const startMarkerIndex = input.indexOf(marker, startIndex);

        // If the start marker is not found, append the remaining text to the output and break
        if (startMarkerIndex === -1) {
            output.value += input.substring(startIndex);
            break;
        }

        // Append the text before the start marker to the output
        output.value += input.substring(startIndex, startMarkerIndex);

        // Find the end marker after the start marker
        const endMarkerIndex = input.indexOf(marker, startMarkerIndex + markerLength);

        // If the end marker is not found, append the remaining text to the output and break
        if (endMarkerIndex === -1) {
            output.value += input.substring(startMarkerIndex + markerLength);
            break;
        }

        // Extract and process the special content between the markers
        const specialContent = input.substring(startMarkerIndex + markerLength, endMarkerIndex);

        // Process the special content here as needed
        // For example, you can apply any desired transformations

        // Append the processed content to the output (you can modify this part)
        // output += '<div class="special-content">' + specialContent + '</div>';
        output.value += openTag + specialContent + closeTag;

        // Update the startIndex to continue searching for more markers
        startIndex = endMarkerIndex + markerLength;
    }

    return {
        output,
    }
}

export function useTableProcessor(inputText: string) {
    const rows = inputText.trim().split('\n').map(row => row.split('|').map(cell => cell.trim()));
    if (rows.length < 3) {
        // Not enough rows to form a table
        return '';
    }

    const headerRow = rows[0];
    const headerCells = headerRow.map(cell => `<th>${cell}</th>`).join('');

    const bodyRows = rows.slice(2).map(row => {
        const bodyCells = row.map(cell => `<td>${cell}</td>`).join('');
        return `<tr>${bodyCells}</tr>`;
    }).join('');

    return `<table>
        <thead>
            <tr>${headerCells}</tr>
        </thead>
        <tbody>
            ${bodyRows}
        </tbody>
    </table>`;
}