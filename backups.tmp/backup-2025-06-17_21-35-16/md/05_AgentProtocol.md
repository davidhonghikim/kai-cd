# 05_AgentProtocol.md
# ChatDemon Agent Protocol
**Title:** Agent Protocol

**Core Principles:**

*   Focus on automating repetitive tasks.
*   Prioritize code quality and maintainability.
*   Use clear and concise commands.

**Commands:**

*   `/h` - Show help menu.
*   `/c` - Continue with the current task.
*   `/md reload` - Reload markdown documentation.
*   `/g commit "<message>"` - Commit changes to Git with the specified message.
*   `/g push` - Push changes to the remote repository.
*   `/b backup` - Create a backup of the project (including configuration files and artifact storage).
*   `/sv add_service <service_type> <config_json>` - Add a new service connection with the provided configuration.
*   `/sv update_service <service_id> <config_json>` - Update an existing service connection.
*   `/sv remove_service <service_id>` - Remove a service connection.
*   `/test unit` - Run unit tests.
*   `/test integration` - Run integration tests.
*   `/test e2e` - Run end-to-end tests.

**Examples:**

*   `/g commit "Implement model bridging"`
*   `/sv add_service openwebui '{"name": "My OpenWebUI", "url": "http://localhost:3000"}'`