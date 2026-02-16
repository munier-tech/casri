const testSignup = async () => {
    try {
        const response = await fetch("http://localhost:3000/api/auth/signUp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "testadmin" + Date.now(),
                email: "testadmin" + Date.now() + "@example.com",
                password: "password123",
                role: "Admin"
            })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
};

testSignup();
