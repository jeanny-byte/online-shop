"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var dashboard_1 = require("./api/dashboard");
var products_1 = require("./api/products");
var app = (0, express_1.default)();
var PORT = process.env.PORT || 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API routes
app.get('/api/dashboard', dashboard_1.dashboardHandler);
app.get('/api/products/:id', products_1.getProductHandler);
// Health check
app.get('/api/health', function (req, res) { return res.json({ status: 'ok' }); });
app.listen(PORT, function () {
    console.log("Server running on http://localhost:".concat(PORT));
});
