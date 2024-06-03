import { AssessmentResponseTranscriptWords } from './../../interview/models/assessments/assessment.response.schema';

function convertToSeconds(milliseconds: number) {
    return milliseconds / 1000;
}

export function mapTranscriptWordsToObjects(transcriptWords: AssessmentResponseTranscriptWords[], index:number) {
    let mappedTranscripts = [];
    let currentTranscript = {
        transcript: '',
        start: convertToSeconds(transcriptWords[0].start),
        end: 0,
        mapIndex: index
    };

    transcriptWords.forEach(word => {
        if (currentTranscript.transcript) {
            currentTranscript.transcript += ` ${word.text}`;
        } else {
            currentTranscript.transcript = word.text;
        }
        currentTranscript.end = convertToSeconds(word.end);

        if (word.text.endsWith('.')) {
            mappedTranscripts.push(currentTranscript);
            currentTranscript = {
                transcript: '',
                start: 0,
                end: 0,
                mapIndex: index
            };
        } else if (!currentTranscript.start) {
            currentTranscript.start = convertToSeconds(word.start);
        }
    });

    if (currentTranscript.transcript) {
        mappedTranscripts.push(currentTranscript);
    }

    return mappedTranscripts;
}

