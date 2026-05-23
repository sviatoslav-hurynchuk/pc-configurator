<?php
    namespace App\Core;

    class RateLimiter {
        private string $logFile;
        private int $limit;
        private int $timeFrame;

        public function __construct(string $logFile = null, int $limit = 60, int $timeFrame = 60) {
            $this->logFile = $logFile ?: dirname(__DIR__, 2) . '/requests.log';
            $this->limit = $limit;
            $this->timeFrame = $timeFrame;
        }

        public function check(string $ip): bool {
            $now = time();
            $requests = [];
            $ipCount = 0;

            if (file_exists($this->logFile)) {
                $handle = fopen($this->logFile, 'r');
                if ($handle) {
                    while (($line = fgets($handle)) !== false) {
                        $line = trim($line);
                        if (empty($line)) continue;

                        $parts = explode('|', $line);
                        if (count($parts) === 2) {
                            $logIp = $parts[0];
                            $logTime = (int)$parts[1];

                            if ($now - $logTime <= $this->timeFrame) {
                                $requests[] = ['ip' => $logIp, 'time' => $logTime];
                                if ($logIp === $ip) {
                                    $ipCount++;
                                }
                            }
                        }
                    }
                    fclose($handle);
                }
            }

            $requests[] = ['ip' => $ip, 'time' => $now];
            $ipCount++;

            $handle = fopen($this->logFile, 'w');
            if ($handle) {
                foreach ($requests as $req) {
                    fwrite($handle, $req['ip'] . '|' . $req['time'] . "\n");
                }
                fclose($handle);
            }

            return $ipCount <= $this->limit;
        }
    }
