CREATE TABLE Metrics (
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	user_id INT UNSIGNED NOT NULL,
    type VARCHAR(32) NOT NULL,
	metrics JSON NOT NULL DEFAULT JSON_OBJECT(),
	PRIMARY KEY(time, user_id, type),
	CONSTRAINT metric_user FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE
);