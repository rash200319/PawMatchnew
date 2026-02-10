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
                u.id, u.name, u.email, u.role, 
                COALESCE(s.organization_name, u.shelter_name, u.name) as shelter_name, 
                COALESCE(s.contact_number, u.phone_number) as phone_number,
                s.shelter_description, s.shelter_address, s.shelter_logo_url, 
                s.shelter_banner_url, s.shelter_social_links, s.shelter_website, 
                s.shelter_tagline, 
                s.verification_status 
            FROM users u
            JOIN shelters s ON u.id = s.user_id
            WHERE u.id = ?
        `, [id]);

        const shelters = shelterRes.rows || shelterRes;
        if (shelters.length === 0) {
            return res.status(404).json({ error: "Shelter not found" });
        }

        const shelter = shelters[0];

        // 2. Get Available Pets for this Shelter
        const petsRes = await db.query(`
            SELECT id, name, type, breed, age, gender, size, image_url, status, is_foster
            FROM pets 
            WHERE shelter_id = ? 
            ORDER BY created_at DESC
        `, [id]);

        const pets = petsRes.rows || petsRes;

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
