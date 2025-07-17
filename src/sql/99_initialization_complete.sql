-- Database Initialization Completion Script
-- This script is executed last to mark the database as fully initialized

-- Final initialization check and summary
INSERT INTO salondb.db_initialization_log (script_name, status) 
VALUES ('99_initialization_complete.sql', 'SUCCESS');

-- Optional: Display initialization summary (for debugging)
-- SELECT 'Database initialization completed successfully. Summary:' AS status;
-- SELECT script_name, executed_at, status FROM db_initialization_log ORDER BY executed_at;

-- Create a final marker to prevent re-initialization
CREATE TABLE IF NOT EXISTS db_ready_marker (
    initialized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version VARCHAR(20) DEFAULT '1.0.0'
);

INSERT INTO db_ready_marker (version) VALUES ('1.0.0');
