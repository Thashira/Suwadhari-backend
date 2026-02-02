/* ======================================================
   1. ENUM TYPES
====================================================== */

CREATE TYPE hospital_type AS ENUM ('lab', 'channel_center', 'hospital');

CREATE TYPE treatment_state AS ENUM ('ongoing', 'completed', 'cancelled');

CREATE TYPE lab_report_status AS ENUM ('pending', 'completed', 'cancelled');


/* ======================================================
   2. ADDRESS
====================================================== */

CREATE TABLE address (
    address_id SERIAL PRIMARY KEY,
    district VARCHAR(100),
    city VARCHAR(100),
    road VARCHAR(150),
    postal_code VARCHAR(20)
);


/* ======================================================
   3. LOGIN
====================================================== */

CREATE TABLE login (
    username VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);


/* ======================================================
   4. PATIENT REGISTRATIONS
====================================================== */

CREATE TABLE patients_registrations (
    patient_id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    birth_day DATE NOT NULL,

    username VARCHAR(100) UNIQUE,
    nic VARCHAR(20) UNIQUE NOT NULL,

    address_id INT,

    email VARCHAR(100) UNIQUE NOT NULL,
    tel VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_patient_login
        FOREIGN KEY (username)
        REFERENCES login(username)
        ON DELETE SET NULL,

    CONSTRAINT fk_patient_address
        FOREIGN KEY (address_id)
        REFERENCES address(address_id)
        ON DELETE SET NULL
);


/* ======================================================
   5. PHYSICIAN DETAILS
====================================================== */

CREATE TABLE physician_details (
    physician_id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    birth_day DATE,

    nic VARCHAR(20) UNIQUE NOT NULL,

    username VARCHAR(100) UNIQUE,

    address_id INT,

    email VARCHAR(100) UNIQUE NOT NULL,
    tel VARCHAR(20),

    role VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_physician_login
        FOREIGN KEY (username)
        REFERENCES login(username)
        ON DELETE SET NULL,

    CONSTRAINT fk_physician_address
        FOREIGN KEY (address_id)
        REFERENCES address(address_id)
        ON DELETE SET NULL
);


/* ======================================================
   6. PHYSICIAN SCHEDULE
====================================================== */

CREATE TABLE physician_schedule (
    schedule_id SERIAL PRIMARY KEY,

    schedule_date DATE NOT NULL,
    schedule_time TIME NOT NULL,

    physician_id INT NOT NULL,

    CONSTRAINT uq_schedule
        UNIQUE(schedule_date, schedule_time, physician_id),

    CONSTRAINT fk_schedule_physician
        FOREIGN KEY (physician_id)
        REFERENCES physician_details(physician_id)
        ON DELETE CASCADE
);


/* ======================================================
   7. HOSPITAL DETAILS
====================================================== */

CREATE TABLE hospital_details (
    hospital_id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    registered_day DATE,

    username VARCHAR(100) UNIQUE,

    address_id INT,

    email VARCHAR(100) UNIQUE NOT NULL,

    type hospital_type,

    tel VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_hospital_login
        FOREIGN KEY (username)
        REFERENCES login(username)
        ON DELETE SET NULL,

    CONSTRAINT fk_hospital_address
        FOREIGN KEY (address_id)
        REFERENCES address(address_id)
        ON DELETE SET NULL
);


/* ======================================================
   8. HOSPITAL ASSETS (M:N)
====================================================== */

CREATE TABLE hospital_assets (
    hospital_id INT,
    physician_id INT,

    PRIMARY KEY (hospital_id, physician_id),

    CONSTRAINT fk_asset_hospital
        FOREIGN KEY (hospital_id)
        REFERENCES hospital_details(hospital_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_asset_physician
        FOREIGN KEY (physician_id)
        REFERENCES physician_details(physician_id)
        ON DELETE CASCADE
);


/* ======================================================
   9. PHARMACY DETAILS
====================================================== */

CREATE TABLE pharmacy_details (
    pharmacy_id SERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    username VARCHAR(100) UNIQUE,

    registered_id VARCHAR(50),

    email VARCHAR(100) UNIQUE NOT NULL,

    address_id INT,

    tel VARCHAR(20),
    fax VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pharmacy_login
        FOREIGN KEY (username)
        REFERENCES login(username)
        ON DELETE SET NULL,

    CONSTRAINT fk_pharmacy_address
        FOREIGN KEY (address_id)
        REFERENCES address(address_id)
        ON DELETE SET NULL
);


/* ======================================================
   10. STOCK
====================================================== */

CREATE TABLE stock (
    item_id SERIAL PRIMARY KEY,

    pharmacy_id INT NOT NULL,

    medical_name VARCHAR(150) NOT NULL,
    brand_name VARCHAR(150),

    quantity INT DEFAULT 0 CHECK (quantity >= 0),

    expiration_date DATE,

    price NUMERIC(10,2) CHECK (price >= 0),

    CONSTRAINT fk_stock_pharmacy
        FOREIGN KEY (pharmacy_id)
        REFERENCES pharmacy_details(pharmacy_id)
        ON DELETE CASCADE
);


/* ======================================================
   11. TREATING RECORDS
====================================================== */

CREATE TABLE treating_records (
    record_id SERIAL PRIMARY KEY,

    physician_id INT,
    patient_id INT NOT NULL,
    hospital_id INT,


    treatment_state treatment_state DEFAULT 'ongoing',

    diagnosis TEXT,
    prescription TEXT,
    remarks TEXT,
    attachments TEXT,
    fee NUMERIC(10,2),

    CONSTRAINT fk_record_physician
        FOREIGN KEY (physician_id)
        REFERENCES physician_details(physician_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_record_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients_registrations(patient_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_record_hospital
        FOREIGN KEY (hospital_id)
        REFERENCES hospital_details(hospital_id)
        ON DELETE SET NULL
);


/* ======================================================
   12. LAB REPORT
====================================================== */

CREATE TABLE lab_report (
    report_id SERIAL PRIMARY KEY,

    patient_id INT NOT NULL,
    physician_id INT,
    hospital_id INT,

    report_date DATE DEFAULT CURRENT_DATE,

    status_of_report lab_report_status DEFAULT 'pending',
    fee NUMERIC(10,2),

    file TEXT,

    CONSTRAINT fk_report_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients_registrations(patient_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_report_physician
        FOREIGN KEY (physician_id)
        REFERENCES physician_details(physician_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_report_hospital
        FOREIGN KEY (hospital_id)
        REFERENCES hospital_details(hospital_id)
        ON DELETE SET NULL
);


/* ======================================================
   13. INDEXES
====================================================== */

CREATE INDEX idx_patient_email ON patients_registrations(email);
CREATE INDEX idx_physician_email ON physician_details(email);

CREATE INDEX idx_record_patient ON treating_records(patient_id);
CREATE INDEX idx_record_physician ON treating_records(physician_id);

CREATE INDEX idx_report_patient ON lab_report(patient_id);


/* ======================================================
   14. TRIGGER FOR updated_at
====================================================== */

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;


/* Attach trigger */

CREATE TRIGGER trg_patient_update
BEFORE UPDATE ON patients_registrations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_physician_update
BEFORE UPDATE ON physician_details
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hospital_update
BEFORE UPDATE ON hospital_details
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_pharmacy_update
BEFORE UPDATE ON pharmacy_details
FOR EACH ROW EXECUTE FUNCTION set_updated_at();