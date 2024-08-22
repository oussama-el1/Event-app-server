# 🎟️ Event Management App

Welcome to the **Event Management App**! This is a robust application designed to help users manage events seamlessly. With our app, users can create, browse, and book tickets for events. Built with modern technologies like **Node.js**, **Express**, **MongoDB**, and **Redis**, this app is optimized for performance and scalability.

## 🌟 Features

- **User Authentication & Authorization**: Secure login, registration, and role-based access.
- **Event Management**: Create, update, and delete events with ease.
- **Ticket Booking**: Book tickets for your favorite events, with support for different ticket types.
- **Real-time Notifications**: Stay updated with real-time notifications about your bookings.
- **Job Queues**: Efficient background processing with **Bull** and **Redis**.

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js** - Web framework for Node.js.
- **MongoDB** - NoSQL database for storing event data.
- **Redis** - In-memory data structure store, used as a database, cache, and message broker.
- **Bull** - Premium queue for handling background jobs.

## 🚀 Getting Started

Follow these steps to get a copy of the project up and running on your local machine.

### Prerequisites

Make sure you have the following installed:

- **Node.js**: [Download Node.js](https://nodejs.org/)
- **MongoDB**: [Download MongoDB](https://www.mongodb.com/try/download/community)
- **Redis**: [Download Redis](https://redis.io/download/)

### 🔧 Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/oussama-el1/Event-app-server
    ```

2. **Navigate to the project directory**:
    ```bash
    cd Event-app-server
    ```

3. **Install dependencies**:
    ```bash
    npm install
    ```

4. **Set up environment variables**:
    Create a `.env` file in the root of the project and add the following:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/event-management
    JWT_SECRET=your_jwt_secret
    REDIS_URL=redis://localhost:6379
    ```

5. **Start the application**:
    ```bash
    npm run start-server
    ```
    The app should now be running on `http://localhost:5000`.

6. **Start the email worker**:
    ```bash
    npm run email-worker
    ```

## 🎉 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

**Fork the Project**:

Click on the fork button at the top right of this repository.

**Create your Feature Branch**:

```bash
git checkout -b feature/AmazingFeature
```

**Commit your Changes:**:

```bash
git commit -m 'Add some AmazingFeature'
```

**Push to the Branch:**:

```bash
git push origin feature/AmazingFeature
```
**Open a Pull Request.**


## 📞 Contact
#### Team Emails : 
 - olhadaoui8@gmail.com
 - 
 - 
 - 
