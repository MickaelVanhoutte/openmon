export class Notifications {
    messages: string[] = [];
    observers: ((messages: string[]) => void)[] = [];

    notify(message: string) {
        this.messages.push(message);
        setTimeout(() => {
            this.messages.shift();
            this.notifyObservers();
        }, 5000);
        this.notifyObservers();
    }


    subscribe(observer: (messages: string[]) => void) {
        this.observers.push(observer);
    }


    private notifyObservers() {
        for (const observer of this.observers) {
            observer(this.messages);
        }
    }
}