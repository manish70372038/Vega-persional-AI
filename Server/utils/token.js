import jwt from "jsonwebtoken";

const genratedtoken = (userId) => {
    try {
        const token = jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        return token; 
    } catch (error) {
        console.error("Token generation failed", error);
        return null;
    }
}

export default genratedtoken;