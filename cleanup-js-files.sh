#!/bin/bash

# Script to remove all JavaScript files that have been converted to TypeScript

echo "Removing JavaScript files that have been converted to TypeScript..."

# Remove main files
rm -f src/app.js
rm -f src/server.js

# Remove files in subdirectories
rm -f src/scripts/init-admin.js
rm -f src/routes/auth.routes.js
rm -f src/routes/user.routes.js
rm -f src/config/database.js
rm -f src/config/swagger.js
rm -f src/config/passport.js
rm -f src/controllers/auth.controller.js
rm -f src/controllers/user.controller.js
rm -f src/middleware/error.middleware.js
rm -f src/middleware/auth.middleware.js
rm -f src/models/user.model.js
rm -f src/services/auth.service.js
rm -f src/services/user.service.js
rm -f src/utils/auth.utils.js

echo "Cleanup complete! All JavaScript files have been removed." 