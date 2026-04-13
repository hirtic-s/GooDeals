package com.goodeal.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Async executor configuration used by {@code @Async}-annotated methods.
 *
 * <p>The {@code scraperExecutor} bean is a thread-pool tuned for I/O-bound scraping:
 * - Core pool size = number of available CPU cores (keeps CPU scheduling lean)
 * - Max pool = 4× cores (headroom for burst scraping)
 * - Queue capacity = 200 (prevents task rejection under moderate load)
 *
 * <p>Note: {@link com.goodeal.service.SearchService} uses a dedicated virtual-thread
 * executor for CompletableFuture tasks. This bean is registered for any
 * {@code @Async("-")} usage elsewhere in the application.
 */
@Configuration
public class AsyncConfig {

    @Bean(name = "scraperExecutor")
    public Executor scraperExecutor() {
        int cores = Runtime.getRuntime().availableProcessors();
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(cores);
        executor.setMaxPoolSize(cores * 4);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("scraper-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}
