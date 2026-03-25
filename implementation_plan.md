# Add Pause/Resume and Error Handling to Sentiment Analysis

This plan proposes the necessary changes to implement pause/resume capabilities and auto-pausing on API errors during the sentiment analysis process in the React dashboard.

## Overview
The goal is to allow the user to pause the ongoing analysis and resume it later. Additionally, if the API returns an error or encounters an exception, the analysis should automatically pause, alerting the user and allowing them to resume once the issue is resolved (e.g., local model server is restarted).

## Proposed Changes

### [src/types.ts](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/types.ts)
- Add a new status property to [AnalysisStats](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/types.ts#12-30) and/or introduce a new top-level state to track the analysis status. We can keep it in [App.tsx](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/App.tsx) state `analysisStatus: 'idle' | 'running' | 'paused' | 'error' | 'finished'`.

### [src/App.tsx](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/App.tsx)
- **State Additions:**
  - Add `[analysisStatus, setAnalysisStatus] = useState<'idle' | 'running' | 'paused' | 'error' | 'finished'>('idle')`.
  - Add `[errorMessage, setErrorMessage] = useState<string | null>(null)`.
  - We need to refactor the [startAnalysis](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/App.tsx#270-434) function. Currently, it runs as a single large `for` loop with `await`. To support pausing, we need to be able to break out of the loop or wait inside the loop.
  - A clean way to handle this without completely rewriting the loop into a recursive timeout is to use a mutable ref for control `actionRef.current = 'run' | 'pause' | 'stop'`, or simply check the state variable (though React state updates might be stale inside the async loop if not careful). Alternatively, we can use a `useRef<boolean>` to indicate if it should keep running.
  - Actually, since [startAnalysis](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/App.tsx#270-434) is an async function, if we just use a `while` loop that checks a `ref` for pause status, it can sleep until resumed.
  - A better approach: Create a ref `isPausedRef = useRef(false)` and `isCancelledRef = useRef(false)`. Inside the loop, check `isCancelledRef.current` to break immediately, and `isPausedRef.current` to wait.
  - Wait mechanism:
    ```typescript
    while (isPausedRef.current && !isCancelledRef.current) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    ```
- **Error Handling:**
  - Update [analyzeArabicSentimentBatch](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/services/geminiService.ts#5-47) and [analyzeLocalSentimentBatch](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/services/geminiService.ts#48-78) to throw errors instead of silently returning 'neutral' on failure, OR keep them returning fallback but if they return a specific error flag, trigger the pause. It's better to modify the service functions to throw on network errors, catch it in [App.tsx](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/App.tsx), set `isPausedRef.current = true`, `setAnalysisStatus('error')`, and notify the user.
- **UI Integrations:**
  - Pass `analysisStatus`, `errorMessage` and control functions (`onPause`, `onResume`, `onCancel`) to [AnalysisProgress.tsx](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/components/AnalysisProgress.tsx).

### [src/components/AnalysisProgress.tsx](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/components/AnalysisProgress.tsx)
- Add UI controls:
  - If `status === 'running'`, show a "Pause" button.
  - If `status === 'paused'`, show a "Resume" button and a "Cancel" button.
  - If `status === 'error'`, show the error message in a banner with a "Retry/Resume" button.
- Make the progress bar visually distinct when paused (e.g., striped or different color).

### [src/services/geminiService.ts](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/services/geminiService.ts) & [src/services/localModelService.ts](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/services/localModelService.ts)
- Modify [analyzeLocalSentimentBatch](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/services/geminiService.ts#48-78) to throw an error immediately if the fetch fails, instead of swallowing the error and returning fallback 'neutral'. If we want strict robustness, returning fallback ruins data quality if the model goes down.
- Update [analyzeArabicSentimentBatch](file:///mnt/e/ONGOING_PROJECT/sentimental/5.arabic-sentiment-analysis-dashboard/src/services/geminiService.ts#5-47) similarly if wanted, although local is the primary focus based on context.

## Verification Plan

### Manual Verification
1. Open the dashboard.
2. Ensure the local python server [api.py](file:///mnt/e/ONGOING_PROJECT/sentimental/api.py) is running on port 8555.
3. Upload a CSV file and click "Start Analysis" (using Local Model).
4. **Test Pause/Resume:**
   - While analyzing, click the "Pause" button. Verify the progress stops.
   - Click "Resume". Verify the progress continues from where it left off.
5. **Test Error Auto-Pause:**
   - While analyzing, deliberately stop the local [api.py](file:///mnt/e/ONGOING_PROJECT/sentimental/api.py) server.
   - Observe that the UI catches the error, stops the progress, and displays an error message with a "Resume/Retry" button.
   - Restart the local [api.py](file:///mnt/e/ONGOING_PROJECT/sentimental/api.py) server.
   - Click "Resume/Retry" and verify the analysis successfully completes the remaining items.
