-- Add bike history fields to listings table
ALTER TABLE listings
ADD COLUMN num_owners INTEGER DEFAULT 1,
ADD COLUMN accident_history BOOLEAN DEFAULT false,
ADD COLUMN accident_details TEXT,
ADD COLUMN service_history BOOLEAN DEFAULT false,
ADD COLUMN last_service_date DATE,
ADD COLUMN registration_expiry DATE,
ADD COLUMN insurance_valid BOOLEAN DEFAULT false,
ADD COLUMN original_parts BOOLEAN DEFAULT true,
ADD COLUMN modifications TEXT;

-- Add check constraints
ALTER TABLE listings
ADD CONSTRAINT num_owners_range CHECK (num_owners >= 1 AND num_owners <= 5),
ADD CONSTRAINT accident_details_length CHECK (char_length(accident_details) <= 300),
ADD CONSTRAINT modifications_length CHECK (char_length(modifications) <= 300);
