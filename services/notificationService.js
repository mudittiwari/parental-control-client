import notifee, { AndroidImportance } from "@notifee/react-native";

export async function onDisplayNotification() {

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
    });

    // Display a notification
    await notifee.displayNotification({
        title: '🚨 Alert',
        body: 'This is a high-priority notification!',
        android: {
            channelId,
            smallIcon: 'ic_launcher', // Ensure this icon exists in your Android mipmap
            pressAction: {
                id: 'default',
            },
            sound: 'default',
            importance: AndroidImportance.HIGH
        },
    });
}
