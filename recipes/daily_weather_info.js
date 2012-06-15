/*
 * Name:        Daily Weather Info
 * Author:      Will Klein
 * Github:      https://github.com/WillsLab
 * Twitter:     @willsLab
 *
 * Description: Notify me of the weather every day the first time I unlock my phone.
 */

var messageTemplate = 'Weather: {high}/{conditions}';

console.log('Started script: Notify me of the weather every day the first time I unlock my phone.');

device.screen.on('unlock', function () {
    var locationListener, forecast, high, message, notification;
    var conditions = 'mixed';
    var lastDateScreenUnlocked = device.localStorage.getItem('lastDateScreenUnlocked');
    var today = new Date().toLocaleDateString();

    if (!lastDateScreenUnlocked || lastDateScreenUnlocked !== today) {
        locationListener = device.location.createListener('CELL', 2);

        locationListener.on('changed', function(locSignal) {
            locationListener.stop();

            feeds.weather.get(
                {
                    location: locSignal.location.latitude + ',' + locSignal.location.longitude,
                    time: 0
                },
                function onSuccess(weather) {
                    forecast = weather.forecasts[0];

                    high = forecast.high || weather.now.temperature || '--';

                    if (forecast.rain > 40 || forecast.sky.toLowerCase() === 'rain') {
                        conditions = 'rainy';
                    } else if (forecast.wind.speed  >= 20) {
                        conditions = 'windy';
                    } else if (forecast.sky.toLowerCase() === 'clear') {
                        conditions = 'sunny';
                    }

                    message = messageTemplate;
                    message = message.replace('{high}', high);
                    message = message.replace('{conditions}', conditions);

                    console.log('weather.now.temperature: ' + weather.now.temperature);
                    console.log('weather.forecasts[0].high: ' + forecast.high);
                    console.log('weather.forecasts[0].rain: ' + forecast.rain);
                    console.log('weather.forecasts[0].sky: ' + forecast.sky);
                    console.log('weather.forecasts[0].wind.speed: ' + forecast.wind.speed);

                    notification = device.notifications.createNotification(message);

                    notification.on('click', function () {
                        device.browser.launch(weather.forecastUrl);
                    });

                    notification.show();
                },
                function onError(response, textStatus) {
                    console.error('Failed to get weather: ', textStatus);
                }
            );
        });

        locationListener.start();

        device.localStorage.setItem('lastDateScreenUnlocked', today);
    }
});

console.log('Started script: Notify me of the weather every day the first time I unlock my phone.');