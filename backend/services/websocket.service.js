const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // Map to store client connections

        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
    }

    handleConnection(ws, req) {
        const token = new URL(req.url, 'ws://localhost').searchParams.get('token');
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;

            // Store client connection
            this.clients.set(userId, ws);

            ws.on('message', (message) => {
                this.handleMessage(userId, message);
            });

            ws.on('close', () => {
                this.clients.delete(userId);
            });

        } catch (error) {
            ws.close();
        }
    }

    handleMessage(userId, message) {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'PROJECT_UPDATE':
                    this.broadcastToProject(data.projectId, {
                        type: 'PROJECT_UPDATE',
                        project: data.project
                    });
                    break;
                    
                case 'TASK_UPDATE':
                    this.broadcastToProject(data.projectId, {
                        type: 'TASK_UPDATE',
                        task: data.task
                    });
                    break;
                    
                case 'FILE_UPLOAD':
                    this.broadcastToProject(data.projectId, {
                        type: 'FILE_UPLOAD',
                        file: data.file
                    });
                    break;
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    }

    broadcastToProject(projectId, message) {
        // Get project and send to all team members
        Project.findById(projectId)
            .then(project => {
                if (!project) return;
                
                project.teamMembers.forEach(memberId => {
                    const client = this.clients.get(memberId.toString());
                    if (client && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(message));
                    }
                });
            })
            .catch(error => {
                console.error('Error broadcasting to project:', error);
            });
    }

    sendToUser(userId, message) {
        const client = this.clients.get(userId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }
}

module.exports = WebSocketService; 