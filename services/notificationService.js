import notifee, { AndroidImportance } from "@notifee/react-native";

export async function onDisplayNotification() {

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
            smallIcon: 'ic_launcher', 
            pressAction: {
                id: 'default',
            },
            sound: 'default',
            importance: AndroidImportance.HIGH
        },
    });
}
