# Multi-Chat Listening Feature

## Overview

The multi-chat listening feature allows users to receive messages from multiple chat rooms simultaneously, even when they are not actively viewing those rooms. This enhances the user experience by ensuring that important messages are not missed and provides a seamless way to switch between active conversations.

## Implementation Details

### 1. Enhanced GlobalChatService

The `GlobalChatService` class has been enhanced to:

- Track active rooms using a Set (`activeRooms`)
- Maintain message and typing handlers for each room
- Implement reconnection logic with exponential backoff
- Handle incoming messages from all joined rooms
- Provide methods to join and leave rooms
- Expose a `getActiveRooms()` method to retrieve all active rooms

### 2. Redux Store Enhancements

The chat slice in Redux has been updated to:

- Track unread message counts for each room
- Store notification settings (sound, desktop, badge)
- Maintain last seen messages for each room
- Provide selectors for accessing unread counts and notification settings

### 3. ActiveChatsIndicator Component

A new component has been created to display active chats with unread message counts:

- Shows a floating panel with all active chats (except the current one)
- Displays unread message counts for each chat
- Allows users to click on a chat to navigate to it
- Automatically hides when there are no active chats or only the current chat is active

### 4. ChatPage Integration

The `ChatPage` component has been updated to:

- Handle messages from multiple rooms
- Mark rooms as read when viewed
- Register typing handlers for the current room
- Include the `ActiveChatsIndicator` component

## Usage

When a user receives a message in a room they are not currently viewing:

1. The message is stored in Redux
2. The unread count for that room is incremented
3. The `ActiveChatsIndicator` displays the room with its unread count
4. Users can click on the room in the indicator to navigate to it
5. When a room is viewed, it is automatically marked as read

## Technical Notes

- Socket.io is used for real-time communication
- The service maintains a set of active rooms to track which rooms the user is connected to
- Reconnection logic ensures that the user stays connected to all active rooms
- Message handlers are used to confirm message delivery and update UI accordingly
- Typing handlers provide real-time typing indicators for each room

## Future Enhancements

Potential future enhancements for the multi-chat listening feature:

- Room-specific notification settings
- Muting specific rooms temporarily
- Priority levels for different rooms
- Enhanced offline message handling
- Read receipts for messages