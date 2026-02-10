-- PawMatch Consistent Seeding Script
-- This script clears inconsistent data and populates the database with a clean, working set.

-- 0. Disable Foreign Key Checks for safe deletion
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Clear existing data from specified tables
TRUNCATE TABLE `welfare_logs`;
TRUNCATE TABLE `shelter_messages`;
TRUNCATE TABLE `shelter_visits`;
TRUNCATE TABLE `adoptions`;
TRUNCATE TABLE `foster_assignments`;
TRUNCATE TABLE `pet_views`;
TRUNCATE TABLE `pets`;
TRUNCATE TABLE `activity_logs`;
TRUNCATE TABLE `user_achievements`;
TRUNCATE TABLE `adopters`;
TRUNCATE TABLE `admins`;
TRUNCATE TABLE `shelters`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `animal_reports`;

-- 2. Re-enable Foreign Key Checks
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Seed Users
-- Password for all: 'password123' (Hash: $2b$10$vPHUNV0GCi.OeMp/EIBSqeSCxQLH3bhC01J1WWlxNRUIn7Pw1.U76)
-- Admin: admin@pawmatch.com / password123
-- Shelter: shelter@pawmatch.com / password123
-- Adopter: adopter@pawmatch.com / password123

INSERT INTO `users` (id, name, email, password_hash, role, is_verified, is_email_verified) VALUES
(1, 'Super Admin', 'admin@pawmatch.com', '$2b$10$vPHUNV0GCi.OeMp/EIBSqeSCxQLH3bhC01J1WWlxNRUIn7Pw1.U76', 'admin', 1, 1),
(2, 'Happy Tails Shelter', 'shelter@pawmatch.com', '$2b$10$vPHUNV0GCi.OeMp/EIBSqeSCxQLH3bhC01J1WWlxNRUIn7Pw1.U76', 'shelter', 1, 1),
(3, 'Jane Adopter', 'adopter@pawmatch.com', '$2b$10$vPHUNV0GCi.OeMp/EIBSqeSCxQLH3bhC01J1WWlxNRUIn7Pw1.U76', 'adopter', 1, 1);

-- 4. Seed Profiles
INSERT INTO `admins` (user_id, full_name, department) VALUES
(1, 'Super Admin', 'Executive');

INSERT INTO `shelters` (user_id, organization_name, contact_number, registration_number, verification_status, shelter_code, shelter_slug) VALUES
(2, 'Happy Tails Shelter', '+94 11 234 5678', 'REG-HT-001', 'verified', 'HTS001', 'happy-tails');

INSERT INTO `adopters` (user_id, full_name, phone_number, pawsonality_results) VALUES
(3, 'Jane Adopter', '+94 77 123 4567', '{"1":"apartment","2":"moderate","3":"limited","4":"couple","5":"first","6":"none","7":"suburban"}');

-- 5. Seed Pets (Linked to Shelter User ID 2)
INSERT INTO `pets` (id, name, type, breed, age, gender, size, energy_level, temperament, social_profile, living_situation_match, image_url, shelter_id, status, description, is_foster) VALUES
(1, 'Buddy', 'Dog', 'Golden Retriever', '2 years', 'Male', 'Large', 'active', '["Friendly", "Playful", "Patient"]', '{"cats": true, "dogs": true, "kids": true}', '{"apartment": false, "house_large": true, "rural": true}', 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1000', 2, 'available', 'Buddy is a happy-go-lucky retriever who loves swimming and belly rubs.', 0),
(2, 'Mittens', 'Cat', 'Tabby', '1 year', 'Female', 'Small', 'low', '["Quiet", "Independent", "Affectionate"]', '{"cats": true, "dogs": false, "kids": true}', '{"apartment": true, "house_large": true, "rural": false}', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1000', 2, 'available', 'Mittens is a gentle soul looking for a quiet sunny spot to nap.', 0),
(3, 'Rex', 'Dog', 'German Shepherd Mix', '3 years', 'Male', 'Large', 'athletic', '["Loyal", "Protective", "Smart"]', '{"cats": false, "dogs": true, "kids": false}', '{"apartment": false, "house_large": true, "rural": true}', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?q=80&w=1000', 2, 'available', 'Rex is a smart, protective dog who needs an experienced hand.', 1);

-- 6. Seed Adoptions (Linked to Adopter 3 and Pet 1)
INSERT INTO `adoptions` (id, user_id, pet_id, status, is_status_read) VALUES
(1, 3, 1, 'active', 1);

-- 7. Seed Shelter Messages
INSERT INTO `shelter_messages` (user_id, adoption_id, shelter_id, pet_id, subject, message, response, is_read, is_response_read) VALUES
(3, 1, 2, 1, 'Follow up', 'Hi, Buddy is settling in well! Any specific food brands he likes?', 'Great to hear! He loves any salmon-based kibble.', 1, 1);

-- 8. Seed Shelter Visits
INSERT INTO `shelter_visits` (user_id, pet_id, shelter_id, visit_date, visit_time, status, notes) VALUES
(3, 2, 2, CURDATE() + INTERVAL 2 DAY, '10:30:00', 'scheduled', 'Jane wants to meet Mittens.');

-- 9. Seed Welfare Logs (Linked to Adoption 1)
INSERT INTO `welfare_logs` (adoption_id, mood, notes, risk_flagged, status) VALUES
(1, 'Happy', 'Eating well and playing in the garden.', 0, 'approved');

-- 10. Seed Activity Logs
INSERT INTO `activity_logs` (user_id, action_type, details) VALUES
(3, 'ADOPTION_APPLICATION', '{"petId": 1, "adoptionId": 1}'),
(2, 'PET_ADDED', '{"petId": 1, "name": "Buddy"}');

-- 11. Seed Animal Reports
INSERT INTO `animal_reports` (animal_type, condition_type, location, description, contact_name, contact_phone, status) VALUES
('Dog', 'Injured', 'Main St Junction', 'Found a dog with an injured paw.', 'Anonymous', '00000000', 'pending');
