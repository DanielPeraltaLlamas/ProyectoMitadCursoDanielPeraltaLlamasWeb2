import EventEmitter from 'events';

class NotificationService extends EventEmitter 
{
  constructor() 
  {
    super();
  }

    emitEvent(eventName, payload) 
    {
        console.log(`Evento emitido: ${eventName}`, payload);
        this.emit(eventName, payload);
    }
}

const notificationService = new NotificationService();

notificationService.on('user:registered', (user) => 
{
  console.log(`evento usuario registrado: ${user.email}`);
});

notificationService.on('user:verified', (user) => 
{
  console.log(`evento usuario verificado: ${user.email}`);
});

notificationService.on('user:invited', (user) => 
{
  console.log(`evento usuario invitado: ${user.email}`);
});

notificationService.on('user:deleted', (user) => 
{
  console.log(`evento usuario eliminado: ${user.email}`);
});

export default notificationService;