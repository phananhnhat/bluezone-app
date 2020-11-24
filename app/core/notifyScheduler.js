/*
 * @Project Bluezone
 * @Author Bluezone Global (contact@bluezone.ai)
 * @Createdate 04/26/2020, 16:36
 *
 * This file is part of Bluezone (https://bluezone.ai)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

import {DeviceEventEmitter, Platform} from 'react-native';
import firebase from 'react-native-firebase';
import RNSettings from 'react-native-settings';
import SystemSetting from 'react-native-system-setting';
import moment from 'moment';

import configuration from '../configuration';
import {cancelNotify, pushNotify, removeNotify} from './notify';
import {createNotification, scheduleNotification} from './fcm';
import {FCM_CHANNEL_ID, SMALL_ICON} from '../const/fcm';
import {getLatestVersionApp, getTimeHealthMonitoring} from './storage';
import {CurrentVersionValue} from './version';
import {getBluetoothState, registerBluetoothStateListener} from './bluetooth';
import {PERMISSIONS, RESULTS, check} from 'react-native-permissions';

const MILISECONDS_IN_DAY = 86400000;

const bluetoothGranted = async () => {
  const v = check(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
  return v === RESULTS.GRANTED;
};

const locationGranted = async () => {
  const v = check(PERMISSIONS.IOS.LOCATION_ALWAYS);
  return v === RESULTS.GRANTED;
};

const createScheduleNotifications = (
  scheduleNotifications,
  language,
  startTime = new Date().getTime(),
) => {
  const {itemRepeat = []} = scheduleNotifications || {};
  itemRepeat.length > 0 &&
    itemRepeat.forEach(item => {
      let iDate = new Date().setHours(0, 0, 0, 0) + item.dayStartTime;
      if (iDate < startTime) {
        iDate += MILISECONDS_IN_DAY;
      }
      createSchedulingNotification(
        _createNotification(item.id, scheduleNotifications, language),
        iDate,
      );
    });
};

const clearScheduleNotifications = scheduleScanNotifications => {
  const {itemRepeat = []} = scheduleScanNotifications || {};
  itemRepeat.length > 0 &&
    itemRepeat.forEach(item => {
      cancelNotify(item.id);
    });
};

const scheduleScanNotificationsChange = (
  oldScheduleNotifications,
  newScheduleNotifications,
  language,
  isCreate,
  startTime = new Date().getTime(),
) => {
  const {itemRepeat: oldRepeat = []} = newScheduleNotifications || {};
  const {itemRepeat: newRepeat = []} = oldScheduleNotifications || {};

  oldRepeat.forEach(notify => {
    const tf = newRepeat.find(item => item.id === notify.id);
    if (tf) {
      return;
    }
    // Xoa notify
    cancelNotify(notify.id);
  });

  isCreate &&
    newRepeat.forEach(item => {
      const tf = oldRepeat.find(i => i.id === item.id);
      if (tf) {
        return;
      }

      let iDate = new Date().setHours(0, 0, 0, 0) + item.dayStartTime;
      if (iDate < startTime) {
        iDate += MILISECONDS_IN_DAY;
      }

      // Create schedule
      createSchedulingNotification(
        _createNotification(item.id, newScheduleNotifications, language),
        iDate,
      );
    });
};

// Xử lý thông báo hẹn giờ khi app thiếu chức năng để scan -------------------
const createScheduleScanNotification = (bluetooth, location) => {
  const {iOSScheduleScanNotification, Language} = configuration;
  createScheduleNotifications(iOSScheduleScanNotification, Language);
};

const clearScheduleScanNotification = () => {
  const {iOSScheduleScanNotification} = configuration;
  clearScheduleNotifications(iOSScheduleScanNotification);
};

const scheduleScanNotification_ChangeLanguage = async language => {
  const isEnable = await getBluetoothState();
  if (!isEnable) {
    const {iOSScheduleScanNotification} = configuration;
    clearScheduleScanNotification(iOSScheduleScanNotification, language);
    createScheduleScanNotification(iOSScheduleScanNotification, language);
  }
};

const scheduleScanNotification_SetConfiguration = async (
  oldConfig = {},
  newConfig = {},
) => {
  if (!(await bluetoothGranted())) {
    return;
  }

  const isEnable = await getBluetoothState();
  const {Language} = configuration;
  const {iOSScheduleScanNotification: newSchedule} = oldConfig;
  const {iOSScheduleScanNotification: oldSchedule} = newConfig;
  scheduleScanNotificationsChange(
    oldSchedule,
    newSchedule,
    Language,
    !!isEnable,
  );
};

// Xử lý thông báo ngay lập tức khi app thiếu chức năng để scan -------------------
const createScanNotification = iOSScanNotification => {
  if (!iOSScanNotification) {
    return;
  }

  const {Language} = configuration;
  pushNotify(
    {
      data: {
        ...iOSScanNotification,
        ...{
          text: iOSScanNotification.message,
          textEn: iOSScanNotification.messageEn,
          notifyId: 'scanNotification',
        },
      },
    },
    Language,
  );
};

const clearScanNotification = iOSScanNotification => {
  iOSScanNotification && removeNotify('scanNotification');
};

const scanNotification_ChangeLanguage = async () => {
  const isEnable = await getBluetoothState();
  if (!isEnable) {
    createScanNotification();
  }
};

const scanNotification_SetConfiguration = async () => {
  if (!(await bluetoothGranted())) {
    return;
  }

  const isEnable = await getBluetoothState();
  if (!isEnable) {
    createScanNotification();
  }
};

/**
 * Dat lich nhac khai bao so dien thoai
 */
const creatScheduleRegisterNotification = () => {
  if (configuration.PhoneNumber) {
    return;
  }
  const {ScheduleRegisterNotification, Language} = configuration;
  createScheduleNotifications(ScheduleRegisterNotification, Language);
};

/**
 * Huy toan bo lich nhac khai bao so dien thoai
 */
const clearScheduleRegisterNotification = () => {
  const {ScheduleRegisterNotification} = configuration;
  clearScheduleNotifications(ScheduleRegisterNotification);
};

const scheduleRegisterNotification_ChangeLanguage = () => {
  const {PhoneNumber} = configuration;
  if (PhoneNumber) {
    return;
  }
  clearScheduleRegisterNotification();
  creatScheduleRegisterNotification();
};

const scheduleRegisterNotification_SetConfig = (oldConfig, newConfig) => {
  const {PhoneNumber} = configuration;
  const {Language} = configuration;
  if (PhoneNumber) {
    return;
  }
  const {ScheduleRegisterNotification: oldSchedule} = oldConfig;
  const {ScheduleRegisterNotification: newSchedule} = newConfig;
  scheduleScanNotificationsChange(oldSchedule, newSchedule, Language, true);
};

/**
 * Dat lich nhac cap nhat ban moi
 */
const creatScheduleUpdateAppNotification = () => {
  const {ScheduleUpdateAppNotification, Language} = configuration;
  createScheduleNotifications(ScheduleUpdateAppNotification, Language);
};

/**
 * Huy toan bo lich nhac cap nhat ban moi
 */
const clearScheduleUpdateAppNotification = () => {
  const {ScheduleUpdateAppNotification} = configuration;
  clearScheduleNotifications(ScheduleUpdateAppNotification);
};

const scheduleUpdateAppNotification_ChangeLanguage = () => {
  getLatestVersionApp().then(latestVersion => {
    if (!latestVersion || latestVersion === CurrentVersionValue) {
      return;
    }

    const {ScheduleUpdateAppNotification} = configuration;
    clearScheduleScanNotification(ScheduleUpdateAppNotification);
    createScheduleScanNotification(ScheduleUpdateAppNotification);
  });
};

const scheduleUpdateAppNotification_SetConfig = (oldConfig, newConfig) => {
  getLatestVersionApp().then(latestVersion => {
    if (!latestVersion || latestVersion === CurrentVersionValue) {
      return;
    }

    const {Language} = configuration;
    const {ScheduleUpdateAppNotification: newSchedule} = oldConfig;
    const {ScheduleUpdateAppNotification: oldSchedule} = newConfig;
    scheduleScanNotificationsChange(oldSchedule, newSchedule, Language, true);
  });
};

const creatScheduleAddInfoNotification = () => {
  const {
    ScheduleAddInfoNotification,
    PhoneNumber,
    PersonalInformation,
    Language,
  } = configuration;
  if (!PhoneNumber || PersonalInformation) {
    return;
  }
  createScheduleNotifications(ScheduleAddInfoNotification, Language);
};

const clearScheduleAddInfoNotification = () => {
  const {ScheduleAddInfoNotification} = configuration;
  clearScheduleNotifications(ScheduleAddInfoNotification);
};

const scheduleAddInfoNotification_ChangeLanguage = () => {
  const {PhoneNumber, PersonalInformation} = configuration;
  if (!PhoneNumber || PersonalInformation) {
    return;
  }

  clearScheduleAddInfoNotification();
  creatScheduleAddInfoNotification();
};

const scheduleAddInfoNotification_SetConfig = (oldConfig, newConfig) => {
  const {PhoneNumber, PersonalInformation, Language} = configuration;
  if (!PhoneNumber || PersonalInformation) {
    return;
  }
  const {ScheduleAddInfoNotification: oldSchedule} = oldConfig;
  const {ScheduleAddInfoNotification: newSchedule} = newConfig;
  scheduleScanNotificationsChange(oldSchedule, newSchedule, Language, true);
};

const creatScheduleDeclareDailyHealth = startTime => {
  const {ScheduleDeclareDailyHealth, Language} = configuration;
  if (!ScheduleDeclareDailyHealth) {
    return;
  }
  createScheduleNotifications(ScheduleDeclareDailyHealth, Language, startTime);
};

const clearScheduleDeclareDailyHealth = () => {
  const {ScheduleDeclareDailyHealth} = configuration;
  clearScheduleNotifications(ScheduleDeclareDailyHealth);
};

const clearScheduleDeclareDailyHealthToday = () => {
  clearScheduleDeclareDailyHealth();
  const iDate = new Date().setHours(0, 0, 0, 0) + MILISECONDS_IN_DAY;
  creatScheduleDeclareDailyHealth(iDate);
};

const scheduleDeclareDailyHealth_ChangeLanguage = async () => {
  const {ScheduleDeclareDailyHealth, AppMode} = configuration;
  if (!ScheduleDeclareDailyHealth || AppMode !== 'entry') {
    return;
  }

  const timeHealthMonitoring = await getTimeHealthMonitoring();
  let iDate = new Date().setHours(0, 0, 0, 0);
  if (
    timeHealthMonitoring &&
    moment(timeHealthMonitoring).format('DD/MM/YYYY') ===
      moment().format('DD/MM/YYYY')
  ) {
    iDate += MILISECONDS_IN_DAY;
  }
  clearScheduleDeclareDailyHealth();
  creatScheduleDeclareDailyHealth(iDate);
};

const scheduleDeclareDailyHealth_SetConfig = async (oldConfig, newConfig) => {
  const {ScheduleDeclareDailyHealth, Language, AppMode} = configuration;
  if (!ScheduleDeclareDailyHealth || AppMode !== 'entry') {
    return;
  }
  const {ScheduleDeclareDailyHealth: oldSchedule} = oldConfig;
  const {ScheduleDeclareDailyHealth: newSchedule} = newConfig;

  const timeHealthMonitoring = await getTimeHealthMonitoring();
  let iDate = new Date().setHours(0, 0, 0, 0);
  if (
    timeHealthMonitoring &&
    moment(timeHealthMonitoring).format('DD/MM/YYYY') ===
      moment().format('DD/MM/YYYY')
  ) {
    iDate += MILISECONDS_IN_DAY;
  }

  scheduleScanNotificationsChange(
    oldSchedule,
    newSchedule,
    Language,
    true,
    iDate,
  );
};
// -------------------------------------------------------------------------------------
const _createNotification = (id, n, language) => {
  const isVI = language === 'vi';
  const title = (isVI ? n.title : n.titleEn) || n.title || n.titleEn;
  const text = (isVI ? n.message : n.messageEn) || n.message || n.messageEn;
  const big = (isVI ? n.bigText : n.bigTextEn) || n.bigText || n.bigTextEn;
  const sub = (isVI ? n.subText : n.subTextEn) || n.subText || n.subTextEn;
  const buttonText = isVI ? n.buttonText : n.buttonTextEn;

  const notification = createNotification()
    .setNotificationId(id)
    .setTitle(title)
    .setBody(big)
    .setData({
      ...n.data,
    })
    .setSubtitle(sub)
    .android.setBigText(text)
    .android.setChannelId(FCM_CHANNEL_ID)
    .android.setSmallIcon(SMALL_ICON)
    .android.setLargeIcon(n.largeIcon);

  if (buttonText) {
    const action = new firebase.notifications.Android.Action(
      'open',
      SMALL_ICON,
      buttonText,
    );
    notification.android.addAction(action);
  }
  return notification;
};

const createSchedulingNotification = (notification, time) => {
  scheduleNotification(notification, {
    fireDate: time,
    repeatInterval: 'day',
  });
};

let locationEnable = null;

SystemSetting.isLocationEnabled().then(enable => {
  locationEnable = enable;
});

/**
 * Xu ly su kien trang thai bluetooth thay doi
 * @param isEnable
 */
const bluetoothChangeListener = isEnable => {
  scanServiceChange(isEnable, locationEnable);
};

const locationChangeListener = async e => {
  const enable = e[RNSettings.LOCATION_SETTING] === RNSettings.ENABLED;
  if (enable !== locationEnable) {
    locationEnable = enable;
    const bluetoothEnable = await getBluetoothState();
    scanServiceChange(bluetoothEnable, locationEnable);
  }
};

const scanServiceChange = (bluetooth, location) => {
  const {iOSScanNotificationVersion2} = configuration;
  if (bluetooth && location) {
    clearScheduleScanNotification();
    clearScanNotificationVersion2(iOSScanNotificationVersion2);
  } else {
    clearScheduleScanNotification();
    clearScanNotificationVersion2(iOSScanNotificationVersion2);
    // ----------------------------------------------------------------
    createScheduleScanNotification(bluetooth, location);
    createScanNotificationVersion2(bluetooth, location);
  }
};

const clearScanNotificationVersion2 = iOSScanNotificationVersion2 => {
  iOSScanNotificationVersion2 && removeNotify('scanNotificationVersion2');
};

const getText = (text, conditions) => {
  if (!text) {
    return text;
  }
  const regExs = [
    /<b>(.*)<\/b>/,
    /<!b>(.*)<\/!b>/,
    /<l>(.*)<\/l>/,
    /<!l>(.*)<\/!l>/,
    /<bl>(.*)<\/bl>/,
    /<!bl>(.*)<\/!bl>/,
    /<b!l>(.*)<\/b!l>/,
    /<!(bl)>(.*)<\/!(bl)>/,
  ];
  let textResult = text;
  for (let i = 0; i < regExs.length; i++) {
    const replacement = conditions[i] ? '$1' : '';
    textResult = textResult.replace(regExs[i], replacement);
  }
  return textResult;
};

const createScanNotificationVersion2 = (bluetooth, location) => {
  const {iOSScanNotificationVersion2, Language} = configuration;
  if (!iOSScanNotificationVersion2 || !Language) {
    return;
  }

  const inBluetooth = !bluetooth;
  const inLocation = !location;
  const conditions = [
    inBluetooth,
    !inBluetooth,
    inLocation,
    !inLocation,
    inBluetooth && inLocation,
    !inBluetooth && inLocation,
    inBluetooth && !inLocation,
    !inBluetooth && !inLocation,
  ];

  pushNotify(
    {
      data: {
        ...iOSScanNotificationVersion2,
        ...{
          title: getText(iOSScanNotificationVersion2.title, conditions),
          titleEn: getText(iOSScanNotificationVersion2.titleEn, conditions),
          bigText: getText(iOSScanNotificationVersion2.bigText, conditions),
          bigTextEn: getText(iOSScanNotificationVersion2.bigTextEn, conditions),
          text: getText(iOSScanNotificationVersion2.message, conditions),
          textEn: getText(iOSScanNotificationVersion2.messageEn, conditions),
          notifyId: 'scanNotificationVersion2',
        },
      },
    },
    Language,
  );
};

/**
 * Kiem tra nhac khai so dien thoai moi lan vao app
 * @returns {boolean}
 */
const checkRegisterNotificationOfDay = () => {
  let {
    ScheduleNotifyDay, // Giá trị số ngày để hiển thị thông báo.
    ScheduleNotifyHour, // Khung giờ nhắc trong ngày VD: [8, 13, 20].
    StatusNotifyRegister, // Thời gian cuối cùng hiển thị thông báo.
    PhoneNumber,
    TokenFirebase,
  } = configuration;

  if (PhoneNumber || !TokenFirebase) {
    return false;
  }

  // Trường hợp người dùng "bỏ qua" lần đầu vào app thì sẽ cho hiển thị notify cho app.
  if (!StatusNotifyRegister) {
    return true;
  }

  const date = new Date();
  const currentTimeOfHours = date.getHours();
  const Time_ScheduleNotify = ScheduleNotifyDay * MILISECONDS_IN_DAY;
  StatusNotifyRegister = parseInt(StatusNotifyRegister || new Date().getTime());
  const currentTimeOfDay = date.setHours(0, 0, 0, 0);
  const StatusNotifyRegisterForHour = new Date(StatusNotifyRegister).setHours(
    0,
    0,
    0,
    0,
  );

  // Check trạng thái đến ngày notify
  const checkDay =
    currentTimeOfDay === StatusNotifyRegisterForHour + Time_ScheduleNotify;

  // Check trường hợp đến ngày notify
  // + Trường hợp 1: Ngày + Thời gian hiện tại nhỏ hơn số giờ đầu.
  // + Trường hợp 2: Trạng thái cuối cùng hiển thị notify của ngày.
  if (
    (checkDay && currentTimeOfHours < ScheduleNotifyHour[0]) ||
    (currentTimeOfDay === StatusNotifyRegisterForHour &&
      currentTimeOfHours < ScheduleNotifyHour[0])
  ) {
    return false;
  }

  // Check trường hợp hiển thị ở các khung giờ khác nhau.
  const hoursOld = new Date(StatusNotifyRegister).getHours();
  for (let i = 0; i < ScheduleNotifyHour.length; i++) {
    if (
      i === ScheduleNotifyHour.length - 1 &&
      ScheduleNotifyHour[i] <= hoursOld &&
      ScheduleNotifyHour[i] <= currentTimeOfHours
    ) {
      return false;
    }
    if (
      ScheduleNotifyHour[i] <= hoursOld &&
      ScheduleNotifyHour[i + 1] >= hoursOld &&
      ScheduleNotifyHour[i] <= currentTimeOfHours &&
      ScheduleNotifyHour[i + 1] >= currentTimeOfHours
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Xu ly su kien ngon ngu thay doi, can thiet lap lai cac notify theo ngon ngu moi
 * @param Language
 */
const scheduleNotificationChangeLanguageListener = Language => {
  scheduleRegisterNotification_ChangeLanguage(Language);
  scheduleUpdateAppNotification_ChangeLanguage(Language);
  scheduleAddInfoNotification_ChangeLanguage(Language);
  scheduleDeclareDailyHealth_ChangeLanguage(Language).then();
  if (Platform.OS === 'ios') {
    // scanNotification_ChangeLanguage(Language).then();
    scheduleScanNotification_ChangeLanguage(Language).then();
  }
};

/**
 * Xu ly su kien cau hinh thay doi, can thiet lap lai cac notify theo cau hinh moi
 * @param oldConfig
 */
const scheduleNotificationSetConfigurationListener = oldConfig => {
  scheduleRegisterNotification_SetConfig(oldConfig, configuration);
  scheduleUpdateAppNotification_SetConfig(oldConfig, configuration);
  scheduleAddInfoNotification_SetConfig(oldConfig, configuration);
  scheduleDeclareDailyHealth_SetConfig(oldConfig, configuration).then();
  if (Platform.OS === 'ios') {
    // scanNotification_SetConfiguration(oldConfig, configuration).then();
    scheduleScanNotification_SetConfiguration(oldConfig, configuration).then();
  }
};

if (Platform.OS === 'ios') {
  registerBluetoothStateListener(bluetoothChangeListener);

  DeviceEventEmitter.addListener(
    RNSettings.GPS_PROVIDER_EVENT,
    locationChangeListener,
  );
}

export {
  creatScheduleRegisterNotification,
  clearScheduleRegisterNotification,
  creatScheduleUpdateAppNotification,
  clearScheduleUpdateAppNotification,
  creatScheduleAddInfoNotification,
  clearScheduleAddInfoNotification,
  checkRegisterNotificationOfDay,
  scheduleNotificationChangeLanguageListener,
  scheduleNotificationSetConfigurationListener,
  creatScheduleDeclareDailyHealth,
  clearScheduleDeclareDailyHealth,
  clearScheduleDeclareDailyHealthToday,
};
