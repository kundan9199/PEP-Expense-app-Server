const userDao = require("../dao/userDao")
const profileController = {
    getUserInfo: async (request, response) =>
    {
        try{
            const email = erequest.user.email;
            const user = await userDao.findByEmail(email);
            return response.user({user:user});

        }
        catch(error){
            return response.status(500).json({ message: 'Internal server error' });
        }
    },
};

module.exports = profileController;