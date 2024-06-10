import { AssessmentResponseTranscriptWords } from './../../interview/models/assessments/assessment.response.schema';

function convertToSeconds(milliseconds: number) {
    return milliseconds / 1000;
}

export function mapTranscriptWordsToObjects(transcriptWords: AssessmentResponseTranscriptWords[], index:number) {
    let mappedTranscripts = [];
    let currentTranscript = {
        text: '',
        start: convertToSeconds(transcriptWords[0].start),
        end: 0,
        mapIndex: index
    };

    transcriptWords.forEach(word => {
        if (currentTranscript.text) {
            currentTranscript.text += ` ${word.text}`;
        } else {
            currentTranscript.text = word.text;
        }
        currentTranscript.end = convertToSeconds(word.end);

        if (word.text.endsWith('.')) {
            mappedTranscripts.push(currentTranscript);
            currentTranscript = {
                text: '',
                start: 0,
                end: 0,
                mapIndex: index
            };
        } else if (!currentTranscript.start) {
            currentTranscript.start = convertToSeconds(word.start);
        }
    });

    if (currentTranscript.text) {
        mappedTranscripts.push(currentTranscript);
    }

    return mappedTranscripts;
}

