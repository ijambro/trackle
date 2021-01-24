CREATE TABLE Users (
    id INT UNSIGNED AUTO_INCREMENT,
	email VARCHAR(32) NOT NULL,
	password VARCHAR(32) NOT NULL,
	first_name VARCHAR(32) NOT NULL,
	last_name VARCHAR(32) NOT NULL,
	created_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(id),
	UNIQUE(email) 
);