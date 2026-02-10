const permission = require('../utility/permissions');

const authorize = (requirePermission) => {
    return ( request, response, next) =>
        //auth middleware must run before this middleware
    {
        const user = request.user;
        if(!user){
            return response.status(401).json({message: 'Unauthorized access'});
        }
        const userPermissions = permission[user.role] || [];
        if(!userPermissions.includes(requirePermission)){
            return response.status(403).json({
                message: 'Forbidden: Insufficient Permissions'
            });
        }next();
    }
};
module.exports = authorize;

