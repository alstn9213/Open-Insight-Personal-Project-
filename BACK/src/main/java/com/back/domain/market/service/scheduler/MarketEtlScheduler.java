package com.back.domain.market.service.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

@Slf4j
@Component
public class MarketEtlScheduler {

    @Scheduled(cron = "0 0 4 * * *")
    public void runPythonEtl() {
        log.info("[Scheduler] 상권 데이터 수집 Python 실행");
        String pythonExe = "C:\\kimminsu\\Open-Insight-Personal-Project-\\DATA\\venv\\Scripts\\python.exe"; // 가상환경 python
        String scriptPath = "C:\\kimminsu\\Open-Insight-Personal-Project-\\DATA\\src\\etl\\market_collect.py";
        ProcessBuilder processBuilder = new ProcessBuilder(pythonExe, scriptPath);

        // Python 스크립트의 출력 로그를 캡처하기 위해 리다이렉트 설정
        processBuilder.redirectErrorStream(true);

        try {
            Process process = processBuilder.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;

            while((line = reader.readLine()) != null) log.info("Python ETL:" + line);
            int exitCode = process.waitFor();

            if(exitCode == 0) log.info("✅ [Scheduler] 데이터 수집 완료");
            else log.error("❌ [Scheduler] 데이터 수집 실패. Exit Code: " + exitCode);

        } catch (IOException | InterruptedException e) {
            log.error("🚨 [Scheduler] 스크립트 실행 중 에러 발생", e);
        }
    }
}
