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

import React, {PureComponent} from 'react';
import {Platform, TouchableOpacity, Dimensions} from 'react-native';
import LottieView from 'lottie-react-native';

// Components
import Dot from './Dot';

// Apis
import Service from '../../../../../core/apis/service';

// Styles
import style from '../../styles/index.css';
import {injectIntl, intlShape} from 'react-intl';

// Data
import radar from './data/radar';
import radarOutline from './data/radarOutline';
import {radarBackgroundAnimate} from './data/radarBackground';

import {weakDots, normalDots, strongDots} from './data/dot';
import {
  getRandomDotArrDontExistYet,
  getNewTypeDot,
  getTypeDotByRSSI,
  getRandomDotCount,
} from './data';
import {dev} from '../../../../../core/apis/server';
import {isIPhoneX} from '../../../../../core/utils/isIPhoneX';
import configuration from '../../../../../configuration';
import {
  SCANNING_EN_HEIGHT,
  SCANNING_VI_HEIGHT,
  BOTTOM_IPHONEX_HEIGHT,
  IPHONE_5_HEIGHT,
} from '../../styles/index.css';
import {internalVersion} from '../../../../../core/version';
import SCREEN from '../../../../nameScreen';

// Const
const TIMEOUT = 30000;
const RADAR_LEVELS = [2, 6, 10];
export let logBlueZone = [];
const {height} = Dimensions.get('window');
const RADAR_HEIGHT_VI = isIPhoneX
  ? SCANNING_VI_HEIGHT - BOTTOM_IPHONEX_HEIGHT
  : SCANNING_VI_HEIGHT;
const RADAR_HEIGHT_EN =
  Platform.OS === 'ios' && height === 568
    ? SCANNING_EN_HEIGHT - IPHONE_5_HEIGHT
    : isIPhoneX
    ? SCANNING_EN_HEIGHT - BOTTOM_IPHONEX_HEIGHT
    : SCANNING_EN_HEIGHT;

class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.mapDevice = {};
    this.onScan = this.onScan.bind(this);
    this.onRadarAnimationFinish = this.onRadarAnimationFinish.bind(this);
    this.setDotRef = this.setDotRef.bind(this);
    this.setWeakDotRef = this.setWeakDotRef.bind(this);
    this.setNormalDotRef = this.setNormalDotRef.bind(this);
    this.setStrongDotRef = this.setStrongDotRef.bind(this);
    this.setRadarRef = this.setRadarRef.bind(this);
    this.radarRef = {play: () => {}};

    this.state = {
      levelRadar: 1,
    };

    this.dotRefArr = {
      weak: [],
      normal: [],
      strong: [],
    };
    this.currentDots = [];
    this.realDots = {
      weak: [],
      normal: [],
      strong: [],
    };
    this.fakeDots = {
      weak: [],
      normal: [],
      strong: [],
    };
    this.blueZoners = {};
    this.objectRadar = {};
    this.levelRadar = 1;
    this.radarColorReverse = false;
  }

  componentDidMount() {
    logBlueZone = [];
    this.scanBLEListener = Service.addListenerScanBLE(this.onScan);
    if (Platform.OS === 'android') {
      this.scanBluetoothListener = Service.addListenerScanBluetooth(
        this.onScan,
      );
    }
  }

  componentWillUnmount() {
    this.scanBLEListener && this.scanBLEListener.remove();
    this.scanBluetoothListener && this.scanBluetoothListener.remove();
    const keys = Object.keys(this.mapDevice);
    for (let i = 0; i < keys.length; i++) {
      clearTimeout(this.mapDevice[keys[i]].timer);
      delete this.mapDevice[keys[i]];
    }
  }

  getAllDotType = type => {
    return [...this.realDots[type].map(d => d.dot), ...this.fakeDots[type]];
  };

  addRealDotInRadar = (type, id) => {
    let max = 0;
    switch (type) {
      case 'strong': {
        max = strongDots.length;
        break;
      }
      case 'normal': {
        max = normalDots.length;
        break;
      }
      case 'weak': {
        max = weakDots.length;
        break;
      }
    }

    const dot = getRandomDotArrDontExistYet(
      this.getAllDotType(type),
      1,
      max,
    )[0];
    this.realDots[type].push({
      dot: dot,
      id: id,
    });
  };

  removeRealDotInRadar = (type, id) => {
    // this.realDots[type] = this.realDots[type].filter(d => d.id !== id);
    let i;
    while ((i = this.realDots[type].findIndex(d => d.id === id)) !== -1) {
      this.realDots[type].splice(i, 1);
    }
  };

  changeLevelRadar = countBluezoner => {
    if (this.levelRadar !== this.getLevelRadar(countBluezoner)) {
      this.animateLevelRadar(this.getLevelRadar(countBluezoner));
    }
  };

  animateLevelRadar = newLevel => {
    let frame1;
    let frame2;
    frame1 = (this.levelRadar - 1) * 20;
    frame2 = (newLevel - 1) * 20;

    // TODO: Cần phải gọi play để đảo chiều chuyển động của hoạt ảnh
    //  Lỗi do thư viện sử dụng tính toán chiều chuyển động chưa chính xác.
    if (frame1 < frame2 && this.radarColorReverse === true) {
      this.radarBackgroundAnimate.play(frame2, frame1);
      this.radarColorReverse = false;
    }

    if (frame1 > frame2 && this.radarColorReverse === true) {
      this.radarBackgroundAnimate.play(frame1, frame2);
    }

    if (frame1 > frame2) {
      this.radarColorReverse = true;
    }

    this.radarBackgroundAnimate.play(frame1, frame2);
    this.levelRadar = newLevel;
  };

  getLevelRadar = count => {
    let i = 0;
    while (i < RADAR_LEVELS.length) {
      if (count <= RADAR_LEVELS[i]) {
        return i + 1;
      }
      i++;
    }
    return 4;
  };

  addFakeDotsInRadar = count => {
    let countRemind = count;
    const dotTypes = Object.keys(this.realDots);
    for (let j = 0; j < dotTypes.length; j++) {
      const type = dotTypes[j];
      if (countRemind > 0) {
        let k = 0;
        const max = this.getMaxCountByType(type);
        if (this.getDotCountByType(type) + countRemind <= max) {
          k = countRemind;
          countRemind = 0;
        } else {
          k = max - this.getDotCountByType(type);
          countRemind = countRemind - k;
        }

        const dots = getRandomDotArrDontExistYet(
          this.getAllDotType(type),
          k,
          max,
        );
        this.fakeDots[type].push(...dots);
      }
    }
  };

  removeFakeDotsInRadar = count => {
    const dotTypes = Object.keys(this.realDots);
    let k = count;
    for (let j = 0; j < dotTypes.length; j++) {
      const type = dotTypes[j];
      if (this.fakeDots[type].length > 0) {
        const length = this.fakeDots[type].length;
        const h = length > k ? k : this.fakeDots[type].length;
        this.fakeDots[type].splice(length - h, h);
        k = k - h;
        if (k <= 0) {
          return;
        }
      }
    }
  };

  onScan({id, name = '', address = '', rssi = 0, platform, typeScan}) {
    const keyMap = id && id.length > 0 ? id : name + '@' + address;
    if (this.mapDevice[keyMap]) {
      // Xóa timer cũ
      clearTimeout(this.mapDevice[keyMap].timer);
      delete this.mapDevice[keyMap];
    } else {
      if (keyMap === id) {
        this.blueZoners[id] = rssi;
      }
    }

    let hasDevice = false;
    let indexDevice;
    for (let i = 0; i < logBlueZone.length; i++) {
      if (
        logBlueZone[i].userId === id &&
        logBlueZone[i].name === name &&
        logBlueZone[i].address === address
      ) {
        hasDevice = true;
        indexDevice = i;
      }
    }

    const type = getTypeDotByRSSI(rssi);
    if (!hasDevice) {
      // Thêm vào danh sách
      logBlueZone.push({
        id: keyMap,
        userId: id,
        name,
        address,
        rssi,
        platform,
        typeScan,
        typeRSSI: type,
      });
      this.changeLevelRadar(logBlueZone.length);
      this.addRealDotInRadar(type, keyMap);
    } else {
      const oldTypeRSSI = logBlueZone[indexDevice].typeRSSI;
      const newTypeRSSI = getNewTypeDot(oldTypeRSSI, rssi);

      if (oldTypeRSSI !== newTypeRSSI) {
        this.removeRealDotInRadar(oldTypeRSSI, keyMap);
        this.addRealDotInRadar(newTypeRSSI, keyMap);
        logBlueZone[indexDevice].typeRSSI = newTypeRSSI;
      }

      // Sửa lại danh sách
      logBlueZone[indexDevice].rssi = rssi;
    }

    // Thêm timer
    const timer = setTimeout(() => {
      delete this.mapDevice[keyMap];
      // Xóa khỏi danh sách thiết bị
      for (let i = 0; i < logBlueZone.length; i++) {
        if (
          logBlueZone[i].userId === id &&
          logBlueZone[i].name === name &&
          logBlueZone[i].address === address
        ) {
          this.removeRealDotInRadar(logBlueZone[i].typeRSSI, keyMap);
          logBlueZone.splice(i, 1);
          this.changeLevelRadar(logBlueZone.length);
        }
      }

      if (keyMap === id) {
        delete this.blueZoners[id];
      }
    }, TIMEOUT);

    this.mapDevice[keyMap] = {
      timer,
      time: new Date().getTime(),
    };
  }

  getMaxCountByType = type => {
    if (type === 'strong') {
      return strongDots.length;
    }
    if (type === 'normal') {
      return normalDots.length;
    }
    if (type === 'weak') {
      return weakDots.length;
    }
    return 0;
  };

  getDotCountByType = type => {
    return this.realDots[type].length + this.fakeDots[type].length;
  };

  getRealDotCount = () => {
    return (
      this.realDots.weak.length +
      this.realDots.normal.length +
      this.realDots.strong.length
    );
  };

  getFakeDotCount = () => {
    return (
      this.fakeDots.weak.length +
      this.fakeDots.normal.length +
      this.fakeDots.strong.length
    );
  };

  onRadarAnimationFinish() {
    const realDotCount = this.getRealDotCount();
    const fakeDotCount = this.getFakeDotCount();
    const fakeDotCountRequired = getRandomDotCount(realDotCount) - realDotCount;

    if (fakeDotCount < fakeDotCountRequired) {
      // Add fake dot
      this.addFakeDotsInRadar(fakeDotCountRequired - fakeDotCount);
    }
    if (fakeDotCount > fakeDotCountRequired) {
      // Remove fake dot
      this.removeFakeDotsInRadar(fakeDotCount - fakeDotCountRequired);
    }

    const dotTypes = Object.keys(this.realDots);
    for (let j = 0; j < dotTypes.length; j++) {
      const type = dotTypes[j];
      for (let i = 0; i < this.realDots[type].length; i++) {
        const newDotIndex = this.realDots[type][i].dot;
        this.dotRefArr[type][newDotIndex] &&
          this.dotRefArr[type][newDotIndex].play();
      }

      for (let i = 0; i < this.fakeDots[type].length; i++) {
        const newDotIndex = this.fakeDots[type][i];
        this.dotRefArr[type][newDotIndex] &&
          this.dotRefArr[type][newDotIndex].play();
      }
    }

    // const dotTypes = Object.keys(this.realDots);
    // for (let j = 0; j < dotTypes.length; j++) {
    //   const type = dotTypes[j];
    //   for (let i = 0; i < this.dotRefArr[type].length; i++) {
    //     this.dotRefArr[type][i].play();
    //   }
    // }

    // this.dotRefArr['weak'][32].play();
    // this.dotRefArr['weak'][31].play();
    // this.dotRefArr['weak'][30].play();
    // this.dotRefArr['weak'][29].play();
    // this.dotRefArr['weak'][28].play();
    //
    // this.dotRefArr['weak'][5].play();
    // this.dotRefArr['weak'][6].play();
    // this.dotRefArr['weak'][7].play();
    // this.dotRefArr['weak'][8].play();
    // this.dotRefArr['weak'][9].play();

    // Play radar
    this.radarRef.play();
    this.objectRadar.timeStart = new Date().getTime();
  }

  setDotRef(type, dotIndex, ref) {
    this.dotRefArr[type][dotIndex] = ref;
  }

  setWeakDotRef(dotIndex, ref) {
    this.setDotRef('weak', dotIndex, ref);
  }

  setNormalDotRef(dotIndex, ref) {
    this.setDotRef('normal', dotIndex, ref);
  }

  setStrongDotRef(dotIndex, ref) {
    this.setDotRef('strong', dotIndex, ref);
  }

  setRadarRef(ref) {
    this.radarRef = ref;
  }

  onOpenScanScreen = () => {
    if (internalVersion || dev) {
      this.props.navigation.navigate(SCREEN.WATCH_SCAN, {
        logs: logBlueZone,
      });
    }
  };

  render() {
    const {Language} = configuration;

    return (
      <TouchableOpacity
        style={[
          style.circleScan,
          {
            width: Language === 'vi' ? RADAR_HEIGHT_VI : RADAR_HEIGHT_EN,
            height: Language === 'vi' ? RADAR_HEIGHT_VI : RADAR_HEIGHT_EN,
          },
        ]}
        activeOpacity={1}
        onPress={this.onOpenScanScreen}>
        <LottieView
          loop={false}
          source={radarOutline}
          autoPlay
          renderMode="HARDWARE"
        />
        <LottieView
          loop={false}
          source={radarBackgroundAnimate}
          ref={ref => (this.radarBackgroundAnimate = ref)}
          renderMode="HARDWARE"
        />
        <LottieView
          ref={this.setRadarRef}
          loop={false}
          source={radar}
          onAnimationFinish={this.onRadarAnimationFinish}
          autoPlay
          renderMode="HARDWARE"
        />
        {strongDots.map((dot, index) => {
          return (
            <Dot
              key={dot.nm}
              dot={dot}
              dotIndex={index}
              ref={ref => this.setStrongDotRef(index, ref)}
              objectRadar={this.objectRadar}
            />
          );
        })}
        {normalDots.map((dot, index) => {
          return (
            <Dot
              key={dot.nm}
              dot={dot}
              dotIndex={index}
              ref={ref => this.setNormalDotRef(index, ref)}
              objectRadar={this.objectRadar}
            />
          );
        })}
        {weakDots.map((dot, index) => {
          return (
            <Dot
              key={dot.nm}
              dot={dot}
              dotIndex={index}
              ref={ref => this.setWeakDotRef(index, ref)}
              objectRadar={this.objectRadar}
            />
          );
        })}
      </TouchableOpacity>
    );
  }
}

Index.propTypes = {
  intl: intlShape.isRequired,
};

Index.defaultProps = {};

export default injectIntl(Index);
