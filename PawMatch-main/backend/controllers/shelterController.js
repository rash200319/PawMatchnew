const db = require('../config/db');

exports.sendMessage = async (req, res) => {
    try {
        const { petId, adoptionId, subject, message } = req.body;
        const userId = req.user.id;

        if (!petId && !adoptionId) {
            return res.status(400).json({ error: "Pet ID or Adoption ID is required" });
        }

        let shelter_id;
        let finalPetId = petId;

        // If adoptionId provided, use it to verify
        if (adoptionId) {
            const adoptionRes = await db.query(`
                SELECT a.id, a.pet_id, p.shelter_id 
                FROM adoptions a 
                JOIN pets p ON a.pet_id = p.id 
                WHERE a.id = ? AND a.user_id = ?
            `, [adoptionId, userId]);

            const adoptionArr = adoptionRes.rows || adoptionRes;
            if (adoptionArr.length === 0) {
                return res.status(404).json({ error: "Adoption record not found" });
            }
            shelter_id = adoptionArr[0].shelter_id;
            finalPetId = adoptionArr[0].pet_id;
        } else {
            // Use Pet ID directly
            const petRes = await db.query('SELECT shelter_id FROM pets WHERE id = ?', [petId]);
            const petArr = petRes.rows || petRes;
            if (petArr.length === 0) {
                return res.status(404).json({ error: "Pet not found" });
            }
            shelter_id = petArr[0].shelter_id;
        }

        // 2. Insert Message
        await db.query(`
            INSERT INTO shelter_messages (user_id, adoption_id, pet_id, shelter_id, subject, message)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, adoptionId || null, finalPetId, shelter_id, subject, message]);

        res.json({ success: true, message: "Message sent to shelter" });

    } catch (error) {
        console.error("Value Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getShelterMessages = async (req, res) => {
    try {
        const shelterId = req.user.id;

        const resMsg = await db.query(`
            SELECT m.*, u.name as user_name, u.email as user_email, p.name as pet_name, p.image_url as pet_image
            FROM shelter_messages m 
            JOIN users u ON m.user_id = u.id 
            JOIN pets p ON m.pet_id = p.id 
            WHERE m.shelter_id = ?
            ORDER BY m.created_at DESC
        `, [shelterId]);

        res.json({ success: true, messages: resMsg.rows || resMsg });
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.respondToMessage = async (req, res) => {
    try {
        const { messageId, response } = req.body;
        const shelterId = req.user.id;

        // Verify message belongs to this shelter
        const messageRes = await db.query('SELECT * FROM shelter_messages WHERE id = ? AND shelter_id = ?', [messageId, shelterId]);
        const messages = messageRes.rows || messageRes;

        if (messages.length === 0) {
            return res.status(404).json({ error: "Message not found or unauthorized" });
        }

        await db.query(`
            UPDATE shelter_messages 
            SET response = ?, responded_at = CURRENT_TIMESTAMP, is_read = 1, is_response_read = 0 
            WHERE id = ?
        `, [response, messageId]);

        res.json({ success: true, message: "Response sent successfully" });

    } catch (error) {
        console.error("Respond Message Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getVisitRequests = async (req, res) => {
    try {
        const { shelterId } = req.params;
        const visits = await db.query(`
            SELECT v.*, u.name as user_name, u.email as user_email, p.name as pet_name 
            FROM shelter_visits v 
            JOIN users u ON v.user_id = u.id 
            JOIN pets p ON v.pet_id = p.id 
            WHERE v.shelter_id = ? 
            ORDER BY v.visit_date ASC
        `, [shelterId]);
        res.json({ success: true, visits: visits.rows || visits });
    } catch (error) {
        console.error("Get Visit Requests Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.updateVisitStatus = async (req, res) => {
    try {
        const { visitId } = req.params;
        const { status } = req.body;
        await db.query("UPDATE shelter_visits SET status = ? WHERE id = ?", [status, visitId]);
        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
const matchingService = require('../services/matchingService');

exports.getUserMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const resMsg = await db.query(`
            SELECT m.*, sh.organization_name as shelter_name, p.name as pet_name, p.image_url as pet_image
            FROM shelter_messages m 
            JOIN shelters sh ON m.shelter_id = sh.user_id 
            JOIN pets p ON m.pet_id = p.id 
            WHERE m.user_id = ?
            ORDER BY m.created_at DESC
        `, [userId]);
        res.json({ success: true, messages: resMsg.rows || resMsg });
    } catch (error) {
        console.error("Get User Messages Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getPotentialMatches = async (req, res) => {
    try {
        const shelterId = req.user.id;

        // 1. Get all available pets for this shelter
        const petsRes = await db.query('SELECT * FROM pets WHERE shelter_id = ? AND status = "available"', [shelterId]);
        const pets = petsRes.rows || petsRes;

        // 2. Get all adopters who have quiz results
        const usersRes = await db.query('SELECT id, name, email, pawsonality_results FROM users WHERE role = "adopter" AND pawsonality_results IS NOT NULL');
        const users = usersRes.rows || usersRes;

        const allPotentialMatches = [];

        // 3. For each user, calculate matches and filter for this shelter's pets
        for (const user of users) {
            try {
                const quizResults = JSON.parse(user.pawsonality_results);
                // We use findMatches but we only care about the scores for our pets
                // The service fetches all pets, but we can reuse the logic
                const matches = await matchingService.findMatches(quizResults);

                // Filter matches that belong to this shelter and have high score
                const shelterMatches = matches.filter(m => m.shelter_id == shelterId && m.matchScore >= 80);

                shelterMatches.forEach(match => {
                    allPotentialMatches.push({
                        id: `${user.id}-${match.id}`,
                        user_id: user.id,
                        user_name: user.name,
                        user_email: user.email,
                        pet_id: match.id,
                        pet_name: match.name,
                        pet_image: match.image_url,
                        match_score: match.matchScore,
                        match_reasons: match.matchReasons
                    });
                });
            } catch (e) {
                console.error(`Error processing matches for user ${user.id}:`, e);
            }
        }

        // Sort by highest score
        allPotentialMatches.sort((a, b) => b.match_score - a.match_score);

        res.json({ success: true, matches: allPotentialMatches.slice(0, 20) });

    } catch (error) {
        console.error("Get Potential Matches Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getShelterPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const shelterRes = await db.query(`
            SELECT 
                u.id, 
                u.name as user_name, 
                u.email, 
                u.phone_number as user_phone, 
                u.shelter_name as user_shelter_name,
                u.shelter_description as user_description,
                u.shelter_address as user_address,
                u.role, 
                u.created_at as user_joined,
                s.organization_name, 
                s.contact_number,
                s.shelter_description, 
                s.shelter_address, 
                s.shelter_logo_url, 
                s.shelter_banner_url, 
                s.shelter_social_links, 
                s.shelter_website, 
                s.shelter_tagline, 
                s.verification_status,
                s.created_at as shelter_joined,
                (SELECT COUNT(*) FROM adoptions a JOIN pets p ON a.pet_id = p.id WHERE p.shelter_id = u.id AND a.status IN ('active', 'approved', 'completed')) as adoptions
            FROM users u
            LEFT JOIN shelters s ON u.id = s.user_id
            WHERE u.id = ?
        `, [id]);

        const rows = shelterRes.rows || [];
        if (rows.length === 0) {
            return res.status(404).json({ error: "Shelter not found" });
        }

        const data = rows[0];

        // Debug: Log raw database values
        console.log(`[DEBUG] Raw DB data for shelter ${id}:`);
        console.log(`  - s.organization_name: "${data.organization_name}"`);
        console.log(`  - s.contact_number: "${data.contact_number}"`);
        console.log(`  - s.shelter_address: "${data.shelter_address}"`);
        console.log(`  - u.name: "${data.user_name}"`);
        console.log(`  - u.phone_number: "${data.user_phone}"`);

        // Helper to filter out literal "null" strings or real nulls
        const clean = (val, fallback = "") => {
            if (val === null || val === undefined || val === "null" || val === "NULL" || val === "") {
                return fallback;
            }
            return val;
        };

        // Build shelter object with strict priority: shelters table first, users table as fallback
        const shelter = {
            id: data.id,
            email: data.email,
            role: data.role,

            // Name: shelters.organization_name > users.shelter_name > users.name > "Shelter"
            shelter_name: clean(data.organization_name) || clean(data.user_shelter_name) || clean(data.user_name) || "Shelter",

            // Phone: shelters.contact_number > users.phone_number > "Not provided"
            phone_number: clean(data.contact_number) || clean(data.user_phone) || "Not provided",

            // Address: shelters.shelter_address > users.shelter_address > "Address not provided"
            shelter_address: clean(data.shelter_address) || clean(data.user_address) || "Address not provided",

            // Other fields
            shelter_description: clean(data.shelter_description) || clean(data.user_description) || "",
            shelter_logo_url: clean(data.shelter_logo_url),
            shelter_banner_url: clean(data.shelter_banner_url),
            shelter_social_links: data.shelter_social_links,
            shelter_website: clean(data.shelter_website),
            shelter_tagline: clean(data.shelter_tagline),
            verification_status: clean(data.verification_status, 'pending'),
            created_at: data.shelter_joined || data.user_joined || new Date().toISOString(),
            adoption_count: data.adoptions || 0
        };

        console.log(`[DEBUG] Final shelter object:`);
        console.log(`  - shelter_name: "${shelter.shelter_name}"`);
        console.log(`  - phone_number: "${shelter.phone_number}"`);
        console.log(`  - shelter_address: "${shelter.shelter_address}"`);

        // 2. Get Available Pets for this Shelter
        const petsRes = await db.query(`
            SELECT id, name, type, breed, age, gender, size, image_url, status, is_foster
            FROM pets 
            WHERE shelter_id = ? 
            ORDER BY created_at DESC
        `, [id]);

        const pets = petsRes.rows || [];

        res.json({
            success: true,
            shelter,
            pets
        });

    } catch (error) {
        console.error("Get Public Profile Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getShelterPets = async (req, res) => {
    try {
        const shelterId = req.user.id;
        const petsRes = await db.query('SELECT * FROM pets WHERE shelter_id = ? ORDER BY created_at DESC', [shelterId]);
        const pets = petsRes.rows || petsRes;

        res.json({ success: true, pets });
    } catch (error) {
        console.error("Get Shelter Pets Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};
