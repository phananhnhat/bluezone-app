/*
 * @Project Bluezone
 * @Author Bluezone Global (contact@bluezone.ai)
 * @Createdate 04/28/2020, 21:55
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

import React from 'react';
import * as PropTypes from 'prop-types';
import {
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import {injectIntl, intlShape} from 'react-intl';
import {CheckBox as CheckBox1} from 'react-native-elements';
import ImagePicker from 'react-native-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import NetInfo from '@react-native-community/netinfo';

// Components
import Text, {MediumText} from '../../../base/components/Text';
import CheckBox from '../../../base/components/CheckBox';
import Header from '../../../base/components/Header';
// import InputScrollView from '../../../base/components/InputScrollView';
import FormInput from '../../../base/components/FormInput';
import RadioButton from '../../../base/components/RadioButton';
import SelectPicker from '../../../base/components/SelectPicker';
import TextInfo from './components/TextInfo';
import ModalNotify from './components/ModalNotify';
import {EntryLanguageContext} from './components/LanguageContext';
import SwitchLanguage from './components/SwitchLanguage';
import EntryInfo from './components/EntryInfo';

// Api
import {
  entryDeclaration,
  getEntryInfo,
  requestEntry,
  getEntryInfoByPhoneNumber,
  getAllCountryApi,
  getAllAirPortApi,
  getAllProvinceApi,
  getRegionByParentID,
  CreateAndSendOTPCode,
} from '../../../core/apis/bluezone';

// Storage
import {
  getEntryInfoDeclare,
  setEntryInfoDeclare,
  getEntryObjectGUIDInformation,
  setEntryObjectGUIDInformation,
  setInforEntryPersonObjectGuid,
} from '../../../core/storage';

// Data
import {
  yearBirth,
  symptomData,
  exposureHistoryData,
  quarantinePlaceData,
} from './data';
import SCREEN from '../../nameScreen';
import {DOMAIN} from '../../../core/apis/server';
import configuration, {setAppMode} from '../../../configuration';

// Styles
import styles from './styles/index.css';
import {reportScreenAnalytics} from '../../../core/analytics';
import messages from '../../../core/msg/entryForm';

const VIETNAM_ID = '234';
const regxEmail = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const regxPhoneNumber = /^[\+]?[0-9]{9,15}\b/;

class EntryForm extends React.Component {
  constructor(props) {
    super(props);

    // const now = new Date();
    // const nowString = moment(now).format('DD/MM/YYYY');

    this.now = new Date();

    const {AppMode, PhoneNumber} = configuration;
    this.state = {
      portraitURL: null,
      portraitBase64: null,
      gateID: null,
      gateName: '',
      fullName: '',
      yearOfBirth: null,
      gender: '1',
      nationalityID: null,
      nationalityName: '',
      passport: '',
      vehicle_Plane: false,
      vehicle_Ship: false,
      vehicle_Car: false,
      otherVehicles: '',
      vehicleNumber: '',
      vehicleSeat: '',
      isPickerStartDateVisible: false,
      startDateString: 'DD/MM/YYYY',
      startDate: null,
      isPickerEndDateVisible: false,
      endDateString: 'DD/MM/YYYY',
      endDate: null,
      startCountryID: null,
      startCountryName: '',
      startProvince: '',
      startProvinceID: null,
      startProvinceName: '',
      country21Day: '',
      endCountryID: VIETNAM_ID,
      endProvinceID: null,
      endProvinceName: '',
      afterQuarantine_ProvinceID: null,
      afterQuarantine_ProvinceName: '',
      afterQuarantine_DistrictID: null,
      afterQuarantine_DistrictName: '',
      afterQuarantine_WardID: null,
      afterQuarantine_WardName: '',
      afterQuarantine_Address: '',
      vn_ProvinceID: null,
      vn_ProvinceName: '',
      vn_DistrictID: null,
      vn_DistrictName: '',
      vn_WardID: null,
      vn_WardName: '',
      vn_Address: '',
      numberPhone: PhoneNumber,
      email: '',
      symptom: {},
      vacxin: '',
      exposureHistory: {},
      testResultImageURL: null,
      testResultImageBase64: null,
      testResult: null,
      testDateString: 'DD/MM/YYYY',
      testDate: null,
      isPickerTestDateVisible: false,
      gates: null,
      countries: null,
      provinces: null,
      vn_Districts: null,
      vn_Ward: null,
      afterQuarantine_Districts: null,
      afterQuarantine_Ward: null,
      quarantinePlace: null,
      otherQuarantinePlace: '',
      statusInternet: 'connected', // connected, connecting, disconnect
      appMode: AppMode,
      objectGUID: props?.route?.params?.objectGUID,
    };
    this.lastVNProvinceIDApi = null;
    this.lastVNDistrictIDApi = null;

    this.lastAfterQuarantineProvinceIDApi = null;
    this.lastAfterQuarantineDistrictIDApi = null;
  }

  async componentDidMount() {
    if (this.state.objectGUID) {
      const objectGUID = await getEntryObjectGUIDInformation();
      this.changeStateWithOutSave({objectGUID: objectGUID});
    }
    getEntryInfoDeclare().then(this.getEntryInfoDeclareStorageCb);
    reportScreenAnalytics(SCREEN.ENTRY_DECLARATION);

    NetInfo.fetch().then(state => {
      this.handleConnectionChange(state.isConnected);
    });

    this.unsubscribeConnectionChange = NetInfo.addEventListener(state => {
      this.handleConnectionChange(state.isConnected);
    });
  }

  componentWillUnmount() {
    this.unsubscribeConnectionChange && this.unsubscribeConnectionChange();
    clearTimeout(this.timeoutConnected);
  }

  getEntryInfoDeclareStorageCb = info => {
    info && this.bindEntryInfoData(info);
    // if (!info) {
    if (this.state.appMode !== 'entry') {
      getEntryInfoByPhoneNumber(data => {
        if (!data) {
          return;
        }
        if (data.Object.ModeEntry) {
          setAppMode('entry');
          this.changeStateWithOutSave({appMode: 'entry'});
        }

        if (
          !this.lastUpdate ||
          new Date(data.LastUpdate).getTime() >
            new Date(this.lastUpdate).getTime()
        ) {
          setEntryObjectGUIDInformation(data.Object.ObjectGuid);
          setInforEntryPersonObjectGuid(data.Object.InforEntryPersonObjectGuid);
          this.changeStateWithOutSave({objectGUID: data.Object.ObjectGuid});
          setEntryInfoDeclare(data.Object);
          this.bindEntryInfoData(data.Object);
        }
      });
    }
    // return;
    // }
  };

  handleConnectionChange = value => {
    const oldValue = this.state.statusInternet !== 'disconnect';
    if (oldValue !== value) {
      this.setState({
        statusInternet: oldValue ? 'disconnect' : 'connecting',
      });

      if (value) {
        this.timeoutConnected = setTimeout(() => {
          this.setState({
            statusInternet: 'connected',
          });
        }, 3000);
      } else {
        clearTimeout(this.timeoutConnected);
      }
    }
  };

  bindEntryInfoData = info => {
    const _vehicleData = JSON.parse(info.ThongTinDiLai);
    const _symptomData = JSON.parse(info.TrieuChungBenh);
    const _exposureHistoryData = JSON.parse(info.LichSuPhoiNhiem);

    const symptom = {};
    _symptomData.forEach(({ID, Value}) => {
      symptom[ID] = Value;
    });

    const exposureHistory = {};
    _exposureHistoryData.forEach(({ID, Value}) => {
      exposureHistory[ID] = Value;
    });

    const timestampNow = new Date().getTime();
    const data = {
      portraitURL:
        info.AnhChanDung &&
        `${DOMAIN}${info.AnhChanDung}?datetime=${timestampNow}`,
      portraitBase64: info.AnhChanDungBase64,
      gateID: info.MaCuaKhau,
      gateName: info.TenCuaKhau,
      fullName: info.FullName || '',
      yearOfBirth: info.NamSinh,
      gender: info.MaGioiTinh && info.MaGioiTinh.toString(),
      nationalityID: info.MaQuocTich && info.MaQuocTich.toString(),
      nationalityName: info.TenQuocTich,
      passport: info.SoHoChieu,
      vehicle_Plane: _vehicleData.find(i => i.ID === '1')?.Value,
      vehicle_Ship: _vehicleData.find(i => i.ID === '2')?.Value,
      vehicle_Car: _vehicleData.find(i => i.ID === '3')?.Value,
      otherVehicles: info.ThongTinDiLaiKhac,
      vehicleNumber: info.SoHieuPhuongTien,
      vehicleSeat: info.SoGhe,
      isPickerStartDateVisible: false,
      startDateString: info.NgayKhoiHanh
        ? moment(new Date(info.NgayKhoiHanh)).format('DD/MM/YYYY')
        : 'DD/MM/YYYY',
      startDate: info.NgayKhoiHanh ? new Date(info.NgayKhoiHanh) : null,
      endDateString: info.NgayNhapCanh
        ? moment(new Date(info.NgayNhapCanh)).format('DD/MM/YYYY')
        : 'DD/MM/YYYY',
      endDate: info.NgayNhapCanh ? new Date(info.NgayNhapCanh) : null,
      startCountryID: info.DiaDiemKhoiHanh_MaQuocGia,
      startCountryName: info.DiaDiemKhoiHanh_TenQuocGia,
      startProvinceID: this.isIDVietNam(info.DiaDiemKhoiHanh_MaQuocGia)
        ? info.DiaDiemKhoiHanh_MaTinh
        : null,
      startProvinceName: this.isIDVietNam(info.DiaDiemKhoiHanh_MaQuocGia)
        ? info.DiaDiemKhoiHanh_TenTinh
        : '',
      startProvince: !this.isIDVietNam(info.DiaDiemKhoiHanh_MaQuocGia)
        ? info.DiaDiemKhoiHanh_MaTinh
        : '',
      country21Day: info.QuocGiaDenTrong21NgayQua,
      endProvinceID: info.DiaDiemNoiDen_MaTinh,
      endProvinceName: info.DiaDiemNoiDen_TenTinh,
      afterQuarantine_ProvinceID: info.DiaChiLuuTruSauCachLy_MaTinh,
      afterQuarantine_ProvinceName: info.DiaChiLuuTruSauCachLy_TenTinh,
      afterQuarantine_DistrictID: info.DiaChiLuuTruSauCachLy_MaHuyen,
      afterQuarantine_DistrictName: info.DiaChiLuuTruSauCachLy_TenHuyen,
      afterQuarantine_WardID: info.DiaChiLuuTruSauCachLy_MaPhuongXa,
      afterQuarantine_WardName: info.DiaChiLuuTruSauCachLy_TenPhuongXa,
      afterQuarantine_Address: info.DiaChiLuuTruSauCachLy_ChiTiet,
      vn_ProvinceID: info.DiaChiLienLac_VN_MaTinh,
      vn_ProvinceName: info.DiaChiLienLac_VN_TenTinh,
      vn_DistrictID: info.DiaChiLienLac_VN_MaHuyen,
      vn_DistrictName: info.DiaChiLienLac_VN_TenHuyen,
      vn_WardID: info.DiaChiLienLac_VN_MaPhuongXa,
      vn_WardName: info.DiaChiLienLac_VN_TenPhuongXa,
      vn_Address: info.DiaChiLienLac_VN_ChiTiet,
      numberPhone: info.SoDienThoai,
      email: info.Email,
      symptom: symptom,
      vacxin: info.VacXinSuDung,
      exposureHistory: exposureHistory,
      testResultImageURL:
        info.FileKetQuaXetNghiem &&
        `${DOMAIN}${info.FileKetQuaXetNghiem}?datetime=${timestampNow}`,
      testResultImageBase64: info.FileKetQuaXetNghiemBase64,
      testResult: info.KetQuaXetNghiem,
      testDateString: info.KetQuaXetNghiem_NgayXetNghiem
        ? moment(new Date(info.KetQuaXetNghiem_NgayXetNghiem)).format(
            'DD/MM/YYYY',
          )
        : 'DD/MM/YYYY',
      testDate: info.KetQuaXetNghiem_NgayXetNghiem
        ? new Date(info.KetQuaXetNghiem_NgayXetNghiem)
        : null,
      quarantinePlace: info.ChonCoSoCachLy
        ? JSON.parse(info.ChonCoSoCachLy).find(i => i.Value === true)?.ID
        : null,
      otherQuarantinePlace: info.ChonCoSoCachLy_Khac,
    };

    this.lastUpdate = info.LastUpdate || info.CreateDate;

    for (const property in data) {
      if (
        data[property] === null ||
        data[property] === undefined ||
        data[property] === ''
      ) {
        delete data[property];
      }
    }
    this.setState(data);
  };

  saveFormState = () => {
    if (this.state.objectGUID) {
      return;
    }

    const {
      portraitBase64,
      gateID,
      fullName,
      yearOfBirth,
      gender,
      nationalityID,
      passport,
      vehicle_Plane,
      vehicle_Ship,
      vehicle_Car,
      otherVehicles,
      vehicleNumber,
      vehicleSeat,
      startDate,
      endDate,
      startCountryID,
      startProvince,
      startProvinceID,
      endCountryID,
      endProvinceID,
      country21Day,
      afterQuarantine_ProvinceID,
      afterQuarantine_DistrictID,
      afterQuarantine_WardID,
      afterQuarantine_Address,
      vn_ProvinceID,
      vn_DistrictID,
      vn_WardID,
      vn_Address,
      numberPhone,
      email,
      symptom,
      vacxin,
      exposureHistory,
      testResultImageBase64,
      testResult,
      quarantinePlace,
      otherQuarantinePlace,
      testDate,
    } = this.state;

    const {
      gateName,
      nationalityName,
      startCountryName,
      startProvinceName,
      endProvinceName,
      afterQuarantine_ProvinceName,
      afterQuarantine_DistrictName,
      afterQuarantine_WardName,
      vn_ProvinceName,
      vn_DistrictName,
      vn_WardName,
    } = this.state;

    const _startDate = startDate && moment(startDate).format('YYYY/MM/DD');
    const _endDate = endDate && moment(endDate).format('YYYY/MM/DD');
    const _testDate = testDate && moment(testDate).format('YYYY/MM/DD');
    const symptomResult = [];
    symptomData.forEach(item => {
      symptomResult.push({
        ID: item.id,
        Text: item.name,
        Value: symptom[item.id],
      });
    });

    const exposureHistoryResult = [];
    exposureHistoryData.forEach(item => {
      exposureHistoryResult.push({
        ID: item.id,
        Value: exposureHistory[item.id],
      });
    });

    const startVN = this.isIDVietNam(startCountryID);
    const data = {
      AnhChanDungBase64: portraitBase64,
      MaCuaKhau: gateID,
      FullName: fullName,
      NamSinh: yearOfBirth,
      MaGioiTinh: gender,
      MaQuocTich: nationalityID,
      SoHoChieu: passport,
      ThongTinDiLai: JSON.stringify([
        {ID: '1', Value: vehicle_Plane},
        {ID: '2', Value: vehicle_Ship},
        {ID: '3', Value: vehicle_Car},
      ]),
      ThongTinDiLaiKhac: otherVehicles,
      SoHieuPhuongTien: vehicleNumber,
      SoGhe: vehicleSeat,
      NgayKhoiHanh: _startDate,
      NgayNhapCanh: _endDate,
      DiaDiemKhoiHanh_MaQuocGia: startCountryID,
      // Xem lại tỉnh của nơi đến khi là viết namSave
      DiaDiemKhoiHanh_MaTinh: this.isIDVietNam(startCountryID)
        ? startProvinceID
        : startProvince,
      DiaDiemNoiDen_MaQuocGia: endCountryID,
      DiaDiemNoiDen_MaTinh: endProvinceID,
      QuocGiaDenTrong21NgayQua: country21Day,
      DiaChiLuuTruSauCachLy_MaTinh: afterQuarantine_ProvinceID,
      DiaChiLuuTruSauCachLy_MaHuyen: afterQuarantine_DistrictID,
      DiaChiLuuTruSauCachLy_MaPhuongXa: afterQuarantine_WardID,
      DiaChiLuuTruSauCachLy_ChiTiet: afterQuarantine_Address,
      DiaChiLienLac_VN_MaTinh: vn_ProvinceID,
      DiaChiLienLac_VN_MaHuyen: vn_DistrictID,
      DiaChiLienLac_VN_MaPhuongXa: vn_WardID,
      DiaChiLienLac_VN_ChiTiet: vn_Address,
      SoDienThoai: numberPhone,
      Email: email,
      TrieuChungBenh: JSON.stringify(symptomResult),
      VacXinSuDung: vacxin,
      LichSuPhoiNhiem: JSON.stringify(exposureHistoryResult),
      KetQuaXetNghiem: testResult,
      FileKetQuaXetNghiemBase64: testResultImageBase64,
      ChonCoSoCachLy: JSON.stringify(
        quarantinePlaceData.map(({id}) => ({
          ID: id,
          Value: id === quarantinePlace,
        })),
      ),
      ChonCoSoCachLy_Khac: otherQuarantinePlace,
      KetQuaXetNghiem_NgayXetNghiem: _testDate,
      TenCuaKhau: gateName,
      TenQuocTich: nationalityName,
      DiaDiemKhoiHanh_TenQuocGia: startCountryName,
      DiaDiemKhoiHanh_TenTinh: startVN ? startProvinceName : startProvince,
      DiaDiemNoiDen_TenTinh: endProvinceName,
      DiaChiLuuTruSauCachLy_TenTinh: afterQuarantine_ProvinceName,
      DiaChiLuuTruSauCachLy_TenHuyen: afterQuarantine_DistrictName,
      DiaChiLuuTruSauCachLy_TenPhuongXa: afterQuarantine_WardName,
      DiaChiLienLac_VN_TenTinh: vn_ProvinceName,
      DiaChiLienLac_VN_TenHuyen: vn_DistrictName,
      DiaChiLienLac_VN_TenPhuongXa: vn_WardName,
    };

    console.log(data);

    for (const property in data) {
      if (
        data[property] === null ||
        data[property] === undefined ||
        data[property] === ''
      ) {
        delete data[property];
      }
    }

    setEntryInfoDeclare(data);
  };

  changeState = (newState, notSave, fn) => {
    console.log(newState);
    this.setState(newState, () => {
      fn && fn();
      !notSave && this.saveFormState();
    });
  };

  changeStateWithOutSave = (newState, fn) => {
    console.log(newState);
    this.setState(newState, fn);
  };

  onSelectPortrait = () => {
    const {intl} = this.props;
    const {formatMessage} = intl;
    const options = {
      title: formatMessage(messages.selectPortrait),
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    this.onSelectImage(options, 'portraitBase64');
  };

  onSelectTestResultImage = () => {
    const {intl} = this.props;
    const {formatMessage} = intl;
    const options = {
      title: formatMessage(messages.selectTestResult),
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    this.onSelectImage(options, 'testResultImageBase64');
  };

  onSelectImage = (options, property) => {
    const {intl} = this.props;
    const {formatMessage} = intl;
    ImagePicker.showImagePicker(
      {
        ...options,
        cancelButtonTitle: formatMessage(messages.cancel),
        takePhotoButtonTitle: formatMessage(messages.takePhoto),
        chooseFromLibraryButtonTitle: formatMessage(messages.selectLibrary),
      },
      response => {
        if (response.didCancel || response.customButton) {
          return;
        }

        if (response.error) {
          this.showAlert(formatMessage(messages.errorPermisson));
          return;
        }

        this.changeState({[property]: response.data});
      },
    );
  };

  onSelectGate = (id, name) => {
    this.changeState({gateID: id, gateName: name});
  };

  onSelectYearOfBirth = year => {
    this.changeState({yearOfBirth: year});
  };

  selectGenderMale = () => {
    this.changeState({gender: '1'});
  };

  selectGenderFemale = () => {
    this.changeState({gender: '2'});
  };

  selectGenderOther = () => {
    this.changeState({gender: '3'});
  };

  onSelectNationality = (id, name) => {
    this.changeState({nationalityID: id, nationalityName: name});
  };

  onChangeStatusVehicle = type => {
    this.changeState({[type]: !this.state[type]});
  };

  showPickerStartDate = () => {
    this.changeStateWithOutSave({isPickerStartDateVisible: true});
  };

  showPickerEndDate = () => {
    this.changeStateWithOutSave({isPickerEndDateVisible: true});
  };

  showPickerTestDate = () => {
    this.changeStateWithOutSave({isPickerTestDateVisible: true});
  };

  confirmPickerStartDate = date => {
    this.changeState({
      startDateString: moment(date).format('DD/MM/YYYY'),
      startDate: date,
      isPickerStartDateVisible: false,
    });
  };

  cancelPickerStartDate = () => {
    this.changeStateWithOutSave({isPickerStartDateVisible: false});
  };

  confirmPickerEndDate = date => {
    this.changeState({
      endDateString: moment(date).format('DD/MM/YYYY'),
      endDate: date,
      isPickerEndDateVisible: false,
    });
  };

  cancelPickerEndDate = () => {
    this.changeStateWithOutSave({isPickerEndDateVisible: false});
  };

  confirmPickerTestDate = date => {
    this.changeState({
      testDateString: moment(date).format('DD/MM/YYYY'),
      testDate: date,
      isPickerTestDateVisible: false,
    });
  };

  cancelPickerTestDate = () => {
    this.changeStateWithOutSave({isPickerTestDateVisible: false});
  };

  onSelectStartCountry = (id, name) => {
    this.changeState({
      startCountryID: id,
      startCountryName: name,
    });
  };

  onSelectStartProvince = (id, name) => {
    this.changeState({
      startProvinceID: id,
      startProvinceName: name,
    });
  };

  onSelectEndProvince = (id, name) => {
    this.changeState({
      endProvinceID: id,
      endProvinceName: name,
    });
  };

  onSelectAfterQuarantineProvince = (id, name) => {
    const {afterQuarantine_ProvinceID} = this.state;
    if (afterQuarantine_ProvinceID === id) {
      return;
    }

    this.changeState({
      afterQuarantine_ProvinceID: id,
      afterQuarantine_ProvinceName: name,
      afterQuarantine_Districts: null,
      afterQuarantine_DistrictID: null,
      afterQuarantine_DistrictName: '',
      afterQuarantine_Ward: null,
      afterQuarantine_WardID: null,
      afterQuarantine_WardName: '',
    });
  };

  onSelectAfterQuarantinePDistrict = (id, name) => {
    const {afterQuarantine_DistrictID} = this.state;
    if (afterQuarantine_DistrictID === id) {
      return;
    }

    this.changeState({
      afterQuarantine_DistrictID: id,
      afterQuarantine_DistrictName: name,
      afterQuarantine_Ward: null,
      afterQuarantine_WardID: null,
      afterQuarantine_WardName: '',
    });
  };

  onSelectAfterQuarantineWard = (id, name) => {
    this.changeState({
      afterQuarantine_WardID: id,
      afterQuarantine_WardName: name,
    });
  };

  onSelectVNProvince = (id, name) => {
    const {vn_ProvinceID} = this.state;
    if (vn_ProvinceID === id) {
      return;
    }

    this.changeState({
      vn_ProvinceID: id,
      vn_ProvinceName: name,
      vn_Districts: null,
      vn_DistrictID: null,
      vn_DistrictName: '',
      vn_Ward: null,
      vn_WardID: null,
      vn_WardName: '',
    });
  };

  onSelectVNPDistrict = (id, name) => {
    const {vn_DistrictID} = this.state;
    if (vn_DistrictID === id) {
      return;
    }

    this.changeState({
      vn_DistrictID: id,
      vn_DistrictName: name,
      vn_Ward: null,
      vn_WardID: null,
      vn_WardName: '',
    });
  };

  onSelectVNWard = (id, name) => {
    this.changeState({
      vn_WardID: id,
      vn_WardName: name,
    });
  };

  onSelectSymptom = (type, value) => {
    const {symptom} = this.state;
    symptom[type] = value;
    this.changeState({
      symptom,
    });
  };

  onSelectExposureHistory = (type, value) => {
    const {exposureHistory} = this.state;
    exposureHistory[type] = value;
    this.changeState({
      exposureHistory,
    });
  };

  selectTestResult = value => {
    this.changeState({testResult: value});
  };

  onFullNameInputChange = text => {
    this.changeStateWithOutSave({fullName: text});
  };

  onPassportInputChange = text => {
    this.changeStateWithOutSave({passport: text});
  };

  onOtherVehiclesInputChange = text => {
    this.changeStateWithOutSave({otherVehicles: text});
  };

  onVehicleNumberInputChange = text => {
    this.changeStateWithOutSave({vehicleNumber: text});
  };

  onVehicleSeatInputChange = text => {
    this.changeStateWithOutSave({vehicleSeat: text});
  };

  onStartProvinceInputChange = text => {
    this.changeStateWithOutSave({startProvince: text});
  };

  onCountry21DayInputChange = text => {
    this.changeStateWithOutSave({country21Day: text});
  };

  onAfterQuarantineAddressInputChange = text => {
    this.changeStateWithOutSave({afterQuarantine_Address: text});
  };

  onVNAddressInputChange = text => {
    this.changeStateWithOutSave({vn_Address: text});
  };

  onNumberPhoneInputChange = text => {
    this.changeStateWithOutSave({numberPhone: text});
  };

  onEmailInputChange = text => {
    this.changeStateWithOutSave({email: text});
  };

  onVacXinInputChange = text => {
    this.changeStateWithOutSave({vacxin: text});
  };

  isIDVietNam = id => {
    return id === VIETNAM_ID;
  };

  shouldVisibleAfterQuarantineDistrict = () => {
    const {intl} = this.props;
    const {formatMessage} = intl;
    const {afterQuarantine_ProvinceID} = this.state;
    if (!afterQuarantine_ProvinceID) {
      this.showAlert(formatMessage(messages.errorForm1));
      return false;
    }
    return true;
  };

  shouldVisibleAfterQuarantineWard = () => {
    const {intl} = this.props;
    const {formatMessage} = intl;
    const {afterQuarantine_DistrictID} = this.state;
    if (!afterQuarantine_DistrictID) {
      this.showAlert(formatMessage(messages.errorForm2));
      return false;
    }
    return true;
  };

  shouldVisibleVNDistrict = () => {
    const {intl} = this.props;
    const {formatMessage} = intl;
    const {vn_ProvinceID} = this.state;
    if (!vn_ProvinceID) {
      this.showAlert(formatMessage(messages.errorForm1));
      return false;
    }
    return true;
  };

  shouldVisibleVNWard = () => {
    const {intl} = this.props;
    const {formatMessage} = intl;
    const {vn_DistrictID} = this.state;
    if (!vn_DistrictID) {
      this.showAlert(formatMessage(messages.errorForm2));
      return false;
    }
    return true;
  };

  onSelectQuarantinePlace = id => {
    this.changeState({quarantinePlace: id});
  };

  onOtherQuarantinePlaceInputChange = text => {
    this.changeStateWithOutSave({otherQuarantinePlace: text});
  };

  createAndSendOTPCode = () => {
    const {numberPhone} = this.state;
    const {TokenFirebase} = configuration;

    CreateAndSendOTPCode(
      numberPhone,
      TokenFirebase,
      this.createAndSendOTPCodeSuccess,
      this.createAndSendOTPCodeFailure,
    );
  };

  createAndSendOTPCodeSuccess = () => {
    const {numberPhone} = this.state;
    this.props.navigation.navigate(SCREEN.PHONE_NUMBER_VERITY_OTP, {
      phoneNumber: numberPhone,
      contextScreen: 'entry',
    });
  };

  createAndSendOTPCodeFailure = () => {
    const {intl} = this.props;
    const {formatMessage} = intl;
    this.showAlert(formatMessage(messages.errorForm4));
  };

  onSend = () => {
    const {intl} = this.props;
    const {formatMessage} = intl;

    const {PhoneNumber} = configuration;
    if (!PhoneNumber) {
      const {numberPhone} = this.state;
      if (!regxPhoneNumber.test(numberPhone)) {
        this.showAlert(formatMessage(messages.errorForm6));
        return;
      }

      this.props.navigation.navigate(SCREEN.PHONE_NUMBER_REGISTER, {
        phoneNumber: numberPhone,
        contextScreen: 'entry',
      });

      return;
    }

    const {
      portraitBase64,
      gateID,
      fullName,
      yearOfBirth,
      gender,
      nationalityID,
      passport,
      vehicle_Plane,
      vehicle_Ship,
      vehicle_Car,
      otherVehicles,
      vehicleNumber,
      vehicleSeat,
      isPickerStartDateVisible,
      startDateString,
      startDate,
      isPickerEndDateVisible,
      endDateString,
      endDate,
      startCountryID,
      startProvince,
      startProvinceID,
      endCountryID,
      endProvinceID,
      country21Day,
      afterQuarantine_ProvinceID,
      afterQuarantine_DistrictID,
      afterQuarantine_WardID,
      afterQuarantine_Address,
      vn_ProvinceID,
      vn_DistrictID,
      vn_WardID,
      vn_Address,
      numberPhone,
      email,
      symptom,
      vacxin,
      exposureHistory,
      testResultImageBase64,
      testResult,
      quarantinePlace,
      otherQuarantinePlace,
      testDateString,
      testDate,
      objectGUID,
    } = this.state;

    const _startDate = moment(startDate).format('YYYY/MM/DD');
    const _endDate = moment(endDate).format('YYYY/MM/DD');
    const _testDate = moment(testDate).format('YYYY/MM/DD');

    const titleError = '';
    let contentError;
    if (!objectGUID && !portraitBase64) {
      contentError = 'Thiếu thông tin ảnh chân dung';
    }

    if (!gateID) {
      contentError = 'Thiếu thông tin cửa khẩu';
    }

    if (!fullName) {
      contentError = 'Thiếu thông tin họ và tên';
    }

    if (!yearOfBirth) {
      contentError = 'Thiếu thông tin năm sinh';
    }

    if (!gender) {
      contentError = 'Thiếu thông tin giới tính';
    }

    if (!nationalityID) {
      contentError = 'Thiếu thông tin quốc tịch';
    }

    if (!passport) {
      contentError = 'Thiếu thông tin số hộ chiếu hoặc giấy thông hành';
    }

    if (!vehicle_Plane && !vehicle_Ship && !vehicle_Car) {
      contentError = 'Thiếu thông tin phương tiện đi lại';
    }

    if (vehicle_Plane && (!vehicleNumber || !vehicleSeat)) {
      contentError = 'Thiếu thông tin về số hiệu phương tiện và số ghế';
    }

    if (!startDateString) {
      contentError = 'Thiếu thông tin ngày khởi hành';
    }

    if (!endDateString) {
      contentError = 'Thiếu thông tin ngày nhập cảnh';
    }

    if (!startCountryID) {
      contentError = 'Thiếu thông tin quốc gia khởi hành';
    }

    if (this.isIDVietNam(startCountryID) && !startProvinceID) {
      contentError = 'Thiếu thông tin khởi hành';
    }

    if (!this.isIDVietNam(startCountryID) && !startProvince) {
      contentError = 'Thiếu thông tin khởi hành';
    }

    if (!endProvinceID) {
      contentError = 'Thiếu thông tin nơi đến';
    }

    if (!country21Day) {
      contentError = 'Thiếu thông tin quốc gia đến trong 21 ngày qua';
    }

    if (!vn_ProvinceID) {
      contentError = 'Thiếu thông tin tỉnh/thành liên lạc ở Việt Nam';
    }

    if (!vn_DistrictID) {
      contentError = 'Thiếu thông tin quận/huyện liên lạc ở Việt Nam';
    }

    if (!vn_WardID) {
      contentError = 'Thiếu thông tin phường/xã liên lạc ở Việt Nam';
    }

    if (!numberPhone) {
      contentError = 'Thiếu thông tin số điện thoại';
    }

    if (!regxEmail.test(email)) {
      contentError = 'Dia chi email khong chinh xac';
    }

    if (Object.keys(symptom).length < Object.keys(symptomData)) {
      contentError = 'Chưa chọn đủ thông tin triệu chứng trong 21 ngày';
    }

    if (
      Object.keys(exposureHistory).length < Object.keys(exposureHistoryData)
    ) {
      contentError = 'Chưa chọn đủ thông tin lịch sử phơi nhiễm trong 21 ngày';
    }

    if (
      !quarantinePlace ||
      (quarantinePlace === 'quarantineOther' &&
        otherQuarantinePlace.length === 0)
    ) {
      contentError = 'Bạn chưa điền đủ thông tin cơ sở cách ly';
    }

    if (contentError) {
      // Alert.alert(titleError, contentError);
      // Alert.alert(
      //   formatMessage(messages.notification),
      //   formatMessage(messages.errorForm3),
      // );
      this.showAlert(formatMessage(messages.errorForm3));
      return;
    }

    const symptomResult = [];
    symptomData.forEach(item => {
      symptomResult.push({
        ID: item.id,
        Value: symptom[item.id],
      });
    });

    const exposureHistoryResult = [];
    exposureHistoryData.forEach(item => {
      exposureHistoryResult.push({
        ID: item.id,
        Value: exposureHistory[item.id],
      });
    });

    const data = {
      ObjectGuid: objectGUID || '00000000-0000-0000-0000-000000000000',
      AnhChanDungBase64: portraitBase64,
      MaCuaKhau: gateID.toString(),
      FullName: fullName,
      NamSinh: yearOfBirth,
      MaGioiTinh: gender,
      MaQuocTich: nationalityID.toString(),
      SoHoChieu: passport,
      ThongTinDiLai: JSON.stringify([
        {ID: '1', Value: vehicle_Plane},
        {ID: '2', Value: vehicle_Ship},
        {ID: '3', Value: vehicle_Car},
      ]),
      ThongTinDiLaiKhac: otherVehicles,
      SoHieuPhuongTien: vehicleNumber,
      SoGhe: vehicleSeat,
      NgayKhoiHanh: _startDate,
      NgayNhapCanh: _endDate,
      DiaDiemKhoiHanh_MaQuocGia: startCountryID.toString(),
      DiaDiemKhoiHanh_MaTinh: this.isIDVietNam(startCountryID)
        ? startProvinceID.toString()
        : startProvince,
      DiaDiemNoiDen_MaQuocGia: endCountryID.toString(),
      DiaDiemNoiDen_MaTinh: endProvinceID.toString(),
      QuocGiaDenTrong21NgayQua: country21Day,
      DiaChiLuuTruSauCachLy_MaTinh:
        afterQuarantine_ProvinceID && afterQuarantine_ProvinceID.toString(),
      DiaChiLuuTruSauCachLy_MaHuyen:
        afterQuarantine_DistrictID && afterQuarantine_DistrictID.toString(),
      DiaChiLuuTruSauCachLy_MaPhuongXa:
        afterQuarantine_WardID && afterQuarantine_WardID.toString(),
      DiaChiLuuTruSauCachLy_ChiTiet: afterQuarantine_Address,
      DiaChiLienLac_VN_MaTinh: vn_ProvinceID.toString(),
      DiaChiLienLac_VN_MaHuyen: vn_DistrictID.toString(),
      DiaChiLienLac_VN_MaPhuongXa: vn_WardID.toString(),
      DiaChiLienLac_VN_ChiTiet: vn_Address,
      SoDienThoai: numberPhone,
      Email: email,
      TrieuChungBenh: JSON.stringify(symptomResult),
      VacXinSuDung: vacxin,
      LichSuPhoiNhiem: JSON.stringify(exposureHistoryResult),
      KetQuaXetNghiem: !!testResult,
      FileKetQuaXetNghiemBase64: testResultImageBase64,
      ChonCoSoCachLy: JSON.stringify(
        quarantinePlaceData.map(({id}) => ({
          ID: id,
          Value: id === quarantinePlace,
        })),
      ),
      ChonCoSoCachLy_Khac: otherQuarantinePlace,
      KetQuaXetNghiem_NgayXetNghiem: _testDate,
    };

    // const data1 = {
    //   AnhChanDungBase64: "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",
    //   ChonCoSoCachLy: `[{"ID":"quarantine1","Value":true},{"ID":"quarantine2","Value":false},{"ID":"quarantineOther","Value":false}]`,
    //   ChonCoSoCachLy_Khac: "",
    //   DiaChiLienLac_VN_ChiTiet: "Địa chỉ tịa vn",
    //   DiaChiLienLac_VN_MaHuyen: "316",
    //   DiaChiLienLac_VN_MaPhuongXa: "1835",
    //   DiaChiLienLac_VN_MaTinh: "242",
    //   DiaChiLuuTruSauCachLy_ChiTiet: "Đây là địa chỉ luuw trú ",
    //   DiaChiLuuTruSauCachLy_MaHuyen: "318",
    //   DiaChiLuuTruSauCachLy_MaPhuongXa: "1804",
    //   DiaChiLuuTruSauCachLy_MaTinh: "242",
    //   DiaDiemKhoiHanh_MaQuocGia: "45",
    //   DiaDiemKhoiHanh_MaTinh: "Quảng châu",
    //   DiaDiemNoiDen_MaQuocGia: "234",
    //   DiaDiemNoiDen_MaTinh: "268",
    //   Email: "anhnhatphan1995@gmail.com",
    //   FileKetQuaXetNghiemBase64: "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",
    //   FullName: "PHAN ANH NHẬT",
    //   KetQuaXetNghiem: 1,
    //   KetQuaXetNghiem_NgayXetNghiem: "2020/11/05",
    //   LichSuPhoiNhiem: `[{"ID":"exposure1","Value":true},{"ID":"exposure2","Value":false}]`,
    //   MaCuaKhau: "10",
    //   MaGioiTinh: "1",
    //   MaQuocTich: "234",
    //   NamSinh: "1995",
    //   NgayKhoiHanh: "2020/11/01",
    //   NgayNhapCanh: "2020/11/04",
    //   ObjectGuid: "00000000-0000-0000-0000-000000000000",
    //   PhoneNumber: "",
    //   QuocGiaDenTrong21NgayQua: "Đây là quốc gia 21 ngày",
    //   SoDienThoai: "0374571868",
    //   SoGhe: "Đây là phưong riện",
    //   SoHieuPhuongTien: "Đây là phưong riện",
    //   SoHoChieu: "187445267",
    //   ThongTinDiLai: `[{"ID":"1","Value":true},{"ID":"2","Value":true},{"ID":"3","Value":false}]`,
    //   ThongTinDiLaiKhac: "Đây là thồn tin đi lại",
    //   TrieuChungBenh: `[{"ID":"sot","Text":"Sốt","Value":true},{"ID":"ho","Text":"Ho","Value":true},{"ID":"kho_tho","Text":"Khó thở","Value":true},{"ID":"dau_hong","Text":"Đau họng","Value":true},{"ID":"non_buon_non","Text":"Nôn / Buồn nôn","Value":false},{"ID":"tieu_chay","Text":"Tiêu chảy","Value":false},{"ID":"xuat_huyet_ngoai_da","Text":"Xuất huyết ngoài da","Value":false},{"ID":"noi_ban_ngoai_da","Text":"Nổi ban ngoài da","Value":false}]`,VacXinSuDung: "Đây là các xin",
    // };

    entryDeclaration(data, this.declareSuccess, this.declareError);

    // this.props.navigation.replace(SCREEN.ENTRY_DECLARATION_SUCCESS, {
    //   code: '123213',
    //   passport: '345345',
    // });
  };

  declareSuccess = data => {
    const {navigation} = this.props;
    const {
      gateName,
      nationalityName,
      startCountryName,
      startCountryID,
      startProvinceName,
      startProvince,
      endProvinceName,
      afterQuarantine_ProvinceName,
      afterQuarantine_DistrictName,
      afterQuarantine_WardName,
      vn_ProvinceName,
      vn_DistrictName,
      vn_WardName,
    } = this.state;
    const startVN = this.isIDVietNam(startCountryID);

    navigation.replace(SCREEN.ENTRY_DECLARATION_SUCCESS, {
      code: data.Object.ObjectGuid,
      passport: this.state.passport,
    });

    setEntryInfoDeclare({
      ...data.Object,
      TenCuaKhau: gateName,
      TenQuocTich: nationalityName,
      DiaDiemKhoiHanh_TenQuocGia: startCountryName,
      DiaDiemKhoiHanh_TenTinh: startVN ? startProvinceName : startProvince,
      DiaDiemNoiDen_TenTinh: endProvinceName,
      DiaChiLuuTruSauCachLy_TenTinh: afterQuarantine_ProvinceName,
      DiaChiLuuTruSauCachLy_TenHuyen: afterQuarantine_DistrictName,
      DiaChiLuuTruSauCachLy_TenPhuongXa: afterQuarantine_WardName,
      DiaChiLienLac_VN_TenTinh: vn_ProvinceName,
      DiaChiLienLac_VN_TenHuyen: vn_DistrictName,
      DiaChiLienLac_VN_TenPhuongXa: vn_WardName,
    });
    setEntryObjectGUIDInformation(data.Object.ObjectGuid);
    setInforEntryPersonObjectGuid(data.Object.InforEntryPersonObjectGuid);
  };

  declareError = error => {
    const {intl} = this.props;
    const {formatMessage} = intl;
    this.showAlert(formatMessage(messages.errorForm4));
    // TODO by NhatPA.
    // Kiểm tra ko thể sửa thông tin thì cần chuyển sang dạng View luôn
  };

  renderAlert = () => {
    const {visibleAlert, alertTitle, alertContent} = this.state;

    return (
      <ModalNotify
        isVisible={visibleAlert}
        content={alertContent}
        onPress={this.hiddenAlert}
      />
    );
  };

  onVisiblePickerGate = () => {
    const {gates} = this.state;
    if (!gates) {
      getAllAirPortApi(
        data => {
          const _data = data.Object.map(({AirPortID, AirPortName}) => ({
            id: AirPortID.toString(),
            name: AirPortName,
          }));
          this.setState({gates: _data});
        },
        () => {},
      );
    }
  };

  onVisiblePickerCountry = () => {
    const {countries} = this.state;
    if (!countries) {
      getAllCountryApi(
        data => {
          const _data = data.Object.map(({RegionID, RegionName}) => ({
            id: RegionID.toString(),
            name: RegionName,
          }));
          this.setState({countries: _data});
        },
        () => {},
      );
    }
  };

  onVisiblePickerProvince = () => {
    const {provinces} = this.state;
    if (!provinces) {
      getAllProvinceApi(
        data => {
          const _data = data.Object.map(({RegionID, RegionName}) => ({
            id: RegionID.toString(),
            name: RegionName,
          }));
          this.setState({provinces: _data});
        },
        () => {},
      );
    }
  };

  onVisiblePickerAfterQuarantineDistrict = () => {
    const {afterQuarantine_ProvinceID} = this.state;
    if (!afterQuarantine_ProvinceID) {
      return;
    }

    if (afterQuarantine_ProvinceID === this.lastAfterQuarantineProvinceIDApi) {
      return;
    }

    this.lastAfterQuarantineProvinceIDApi = afterQuarantine_ProvinceID;
    getRegionByParentID(
      afterQuarantine_ProvinceID,
      data => {
        const _data = data.Object.map(({RegionID, RegionName}) => ({
          id: RegionID.toString(),
          name: RegionName,
        }));
        this.setState({afterQuarantine_Districts: _data});
      },
      () => {},
    );
  };

  onVisiblePickerAfterQuarantineWard = () => {
    const {afterQuarantine_DistrictID} = this.state;
    if (!afterQuarantine_DistrictID) {
      return;
    }

    if (afterQuarantine_DistrictID === this.lastAfterQuarantineDistrictIDApi) {
      return;
    }

    this.lastAfterQuarantineDistrictIDApi = afterQuarantine_DistrictID;
    getRegionByParentID(
      afterQuarantine_DistrictID,
      data => {
        const _data = data.Object.map(({RegionID, RegionName}) => ({
          id: RegionID,
          name: RegionName,
        }));
        this.setState({afterQuarantine_Ward: _data});
      },
      () => {},
    );
  };

  onVisiblePickerVNDistrict = () => {
    const {vn_ProvinceID} = this.state;
    if (!vn_ProvinceID) {
      return;
    }

    if (vn_ProvinceID === this.lastVNProvinceIDApi) {
      return;
    }

    this.lastVNProvinceIDApi = vn_ProvinceID;
    getRegionByParentID(
      vn_ProvinceID,
      data => {
        const _data = data.Object.map(({RegionID, RegionName}) => ({
          id: RegionID,
          name: RegionName,
        }));
        this.setState({vn_Districts: _data});
      },
      () => {},
    );
  };

  onVisiblePickerVNWard = () => {
    const {vn_DistrictID} = this.state;
    if (!vn_DistrictID) {
      return;
    }

    if (vn_DistrictID === this.lastVNDistrictIDApi) {
      return;
    }

    this.lastVNDistrictIDApi = vn_DistrictID;
    getRegionByParentID(
      vn_DistrictID,
      data => {
        const _data = data.Object.map(({RegionID, RegionName}) => ({
          id: RegionID,
          name: RegionName,
        }));
        this.setState({vn_Ward: _data});
      },
      () => {},
    );
  };

  onEmailInputBlur = () => {
    const {intl} = this.props;
    const {formatMessage} = intl;
    const {email} = this.state;
    if (email && !regxEmail.test(email)) {
      this.showAlert(formatMessage(messages.errorForm5));
    }
    this.saveFormState();
  };

  showAlert = content => {
    this.setState({
      // alertTitle: title,
      alertContent: content,
      visibleAlert: true,
    });
  };

  hiddenAlert = () => {
    this.setState({
      visibleAlert: false,
    });
  };

  navigateOTPEntry = () => {
    const {intl} = this.props;
    const {formatMessage} = intl;

    requestEntry(
      this.state.objectGUID,
      data => {
        // if (data.Object.ModeEntry) {
        //   setAppMode('entry');
        //   this.changeStateWithOutSave({appMode: 'entry'});
        // }
        // this.showAlert(formatMessage(messages.requestEntrySuccess));
      },
      () => {
        // this.showAlert(formatMessage(messages.errorForm4));
      },
    );
  };

  render() {
    const {intl, displayHeader, language} = this.props;
    const {
      portraitURL,
      portraitBase64,
      gateID,
      gateName,
      fullName,
      yearOfBirth,
      gender,
      nationalityID,
      nationalityName,
      passport,
      vehicle_Plane,
      vehicle_Ship,
      vehicle_Car,
      otherVehicles,
      vehicleNumber,
      vehicleSeat,
      isPickerStartDateVisible,
      startDateString,
      startDate,
      isPickerEndDateVisible,
      endDateString,
      endDate,
      startCountryID,
      startCountryName,
      startProvince,
      startProvinceID,
      startProvinceName,
      country21Day,
      endProvinceID,
      endProvinceName,
      afterQuarantine_ProvinceID,
      afterQuarantine_ProvinceName,
      afterQuarantine_DistrictID,
      afterQuarantine_DistrictName,
      afterQuarantine_WardID,
      afterQuarantine_WardName,
      afterQuarantine_Address,
      vn_ProvinceID,
      vn_ProvinceName,
      vn_DistrictID,
      vn_DistrictName,
      vn_WardID,
      vn_WardName,
      vn_Address,
      numberPhone,
      email,
      symptom,
      vacxin,
      exposureHistory,
      testResultImageURL,
      testResultImageBase64,
      testResult,
      testDateString,
      testDate,
      isPickerTestDateVisible,
      gates,
      countries,
      provinces,
      vn_Districts,
      vn_Ward,
      afterQuarantine_Districts,
      afterQuarantine_Ward,
      quarantinePlace,
      otherQuarantinePlace,
      objectGUID,
      statusInternet,
      isView,
      appMode,
    } = this.state;

    const {formatMessage} = intl;
    const vietnamese = language === 'vi';

    const startVN = this.isIDVietNam(startCountryID);

    const portraitSource =
      portraitBase64 || portraitURL
        ? {
            uri: portraitBase64
              ? `data:image/png;base64,${portraitBase64}`
              : portraitURL,
          }
        : require('./images/avatar.png');

    const testResultImageSource =
      testResultImageURL || testResultImageBase64
        ? {
            uri: testResultImageBase64
              ? `data:image/png;base64,${testResultImageBase64}`
              : testResultImageURL,
          }
        : null;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        // keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : -220}
        style={styles.flexOne}>
        <SafeAreaView style={styles.container}>
          {displayHeader && (
            <Header
              styleTitle={styles.textHeader}
              title={formatMessage(messages.header)}
            />
          )}

          {statusInternet !== 'connected' && (
            <View
              style={
                statusInternet === 'disconnect'
                  ? styles.connectRed
                  : styles.connectGreen
              }>
              <Text style={styles.connectContent}>
                {statusInternet === 'disconnect'
                  ? formatMessage(messages.disconnect)
                  : formatMessage(messages.connecting)}
              </Text>
            </View>
          )}

          {appMode === 'entry' ? (
            <EntryInfo data={this.state} />
          ) : (
            <ScrollView
              style={styles.scroll}
              keyboardShouldPersistTaps={'handled'}>
              {appMode !== 'entry' && objectGUID && (
                <View style={styles.OTPEntryContainer}>
                  <TouchableOpacity
                    style={styles.btnOTPEntry}
                    onPress={this.navigateOTPEntry}>
                    <Text style={styles.btnOTPEntryContent}>
                      {formatMessage(messages.btnEntryOTP)}
                    </Text>
                  </TouchableOpacity>
                  <MediumText style={styles.label2}>
                    {formatMessage(messages.content4)}
                  </MediumText>
                </View>
              )}
              <SwitchLanguage />
              <Text style={styles.label1}>
                {formatMessage(messages.content1)}
              </Text>
              <Text style={styles.labelRed}>
                {formatMessage(messages.content2)}
              </Text>

              {/*Anh chan dung*/}
              <View style={styles.itemContainer}>
                <TextInfo
                  styleContainer={styles.itemTitle}
                  text={formatMessage(messages.portrait)}
                  star
                />

                <View style={styles.portraitContainer}>
                  <TouchableOpacity
                    onPress={this.onSelectPortrait}
                    activeOpacity={1}
                    style={
                      portraitBase64 || portraitURL
                        ? styles.portraitImageBtn
                        : styles.portraitBtn
                    }>
                    <Image
                      style={styles.portraitImage}
                      source={portraitSource}
                    />
                    {!portraitBase64 && !portraitURL && (
                      <Image
                        style={styles.camera}
                        source={require('./images/camera.png')}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/*Cua khau*/}
              <View style={styles.itemContainer}>
                <TextInfo
                  styleContainer={styles.itemTitle}
                  text={formatMessage(messages.gate)}
                  star
                />
                <SelectPicker
                  enableSearch={true}
                  data={gates}
                  loading={!gates}
                  value={gateID}
                  content={gateName}
                  headerText={formatMessage(messages.selectGate)}
                  placeholder={formatMessage(messages.select)}
                  onVisible={this.onVisiblePickerGate}
                  onSelect={this.onSelectGate}
                />
              </View>

              {/*Ho ten*/}
              <FormInput
                title={formatMessage(messages.fullName)}
                star={true}
                autoCapitalize="characters"
                onChangeText={this.onFullNameInputChange}
                value={fullName}
                onBlur={this.saveFormState}
              />

              {/*Nam sinh*/}
              <View style={styles.itemContainer}>
                <TextInfo
                  styleContainer={styles.itemTitle}
                  text={formatMessage(messages.yearOfBirth)}
                  star
                />
                <SelectPicker
                  data={yearBirth}
                  value={yearOfBirth}
                  headerText={formatMessage(messages.selectYearOfBirth)}
                  placeholder={formatMessage(messages.select)}
                  onSelect={this.onSelectYearOfBirth}
                />
              </View>

              {/*Gioi tinh*/}
              <View style={styles.itemContainer}>
                <TextInfo
                  text={formatMessage(messages.gender)}
                  styleContainer={styles.itemTitle}
                  star
                />
                <View style={styles.flexRow}>
                  <TouchableOpacity
                    style={styles.genderFirstItemContainer}
                    onPress={this.selectGenderMale}>
                    <RadioButton
                      checked={gender === '1'}
                      onPress={this.selectGenderMale}
                    />
                    <MediumText
                      style={styles.gender}
                      text={formatMessage(messages.male)}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.genderItemContainer}
                    onPress={this.selectGenderFemale}>
                    <RadioButton
                      checked={gender === '2'}
                      onPress={this.selectGenderFemale}
                    />
                    <MediumText
                      style={styles.gender}
                      text={formatMessage(messages.female)}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.genderItemContainer}
                    onPress={this.selectGenderOther}>
                    <RadioButton
                      checked={gender === '3'}
                      onPress={this.selectGenderOther}
                    />
                    <MediumText
                      style={styles.gender}
                      text={formatMessage(messages.genderOther)}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/*Quoc tich*/}
              <View style={styles.itemContainer}>
                <TextInfo
                  styleContainer={styles.itemTitle}
                  text={formatMessage(messages.nationality)}
                  star
                />
                <SelectPicker
                  enableSearch={true}
                  data={countries}
                  loading={!countries}
                  value={nationalityID}
                  content={nationalityName}
                  headerText={formatMessage(messages.selectNationality)}
                  placeholder={formatMessage(messages.select)}
                  onVisible={this.onVisiblePickerCountry}
                  onSelect={this.onSelectNationality}
                />
              </View>

              {/*So ho chieu / giay thong hanh*/}
              <FormInput
                title={formatMessage(messages.passportNumber)}
                star={true}
                placeholder={formatMessage(messages.passportPlaceholder)}
                onChangeText={this.onPassportInputChange}
                value={passport}
                onBlur={this.saveFormState}
              />

              {/*Thong tin di lai*/}
              <View style={styles.itemContainer}>
                <TextInfo
                  styleContainer={styles.itemTitle}
                  text={formatMessage(messages.vehicleInformation)}
                  star
                />
                <View style={styles.flexRow}>
                  <CheckBox
                    checked={vehicle_Plane}
                    title={formatMessage(messages.planes)}
                    onPress={() => this.onChangeStatusVehicle('vehicle_Plane')}
                    containerStyle={styles.checkboxContainer}
                    textStyle={styles.checkBoxText}
                  />
                  <CheckBox
                    checked={vehicle_Ship}
                    title={formatMessage(messages.ship)}
                    onPress={() => this.onChangeStatusVehicle('vehicle_Ship')}
                    containerStyle={styles.checkboxContainer}
                    textStyle={styles.checkBoxText}
                  />
                  <CheckBox
                    checked={vehicle_Car}
                    title={formatMessage(messages.car)}
                    onPress={() => this.onChangeStatusVehicle('vehicle_Car')}
                    containerStyle={styles.checkboxContainer}
                    textStyle={styles.checkBoxText}
                  />
                </View>

                <TextInfo
                  styleContainer={[styles.headerTwoContainer, {marginTop: 10}]}
                  style={styles.headerTwo}
                  text={formatMessage(messages.vehicleOther)}
                />
                <TextInput
                  style={styles.textInput}
                  onChangeText={this.onOtherVehiclesInputChange}
                  value={otherVehicles}
                  onBlur={this.saveFormState}
                />
              </View>

              {/*<View style={styles.flexRow}>*/}
              {/*So hieu phuong tien*/}
              <FormInput
                containerStyle={styles.vehicleNumber}
                title={formatMessage(messages.vehicleNumber)}
                onChangeText={this.onVehicleNumberInputChange}
                value={vehicleNumber}
                maxLength={35}
                onBlur={this.saveFormState}
              />

              {/*So ghe*/}
              <FormInput
                containerStyle={styles.vehicleSeat}
                title={formatMessage(messages.vehicleSeat)}
                onChangeText={this.onVehicleSeatInputChange}
                value={vehicleSeat}
                maxLength={20}
                onBlur={this.saveFormState}
              />
              {/*</View>*/}

              {/*Ngay khoi hanh*/}
              <View style={styles.itemContainer}>
                <TextInfo
                  styleContainer={styles.itemTitle}
                  text={formatMessage(messages.startDay)}
                  star
                />
                <Text style={styles.date} onPress={this.showPickerStartDate}>
                  {startDateString}
                </Text>
                <DateTimePickerModal
                  isVisible={isPickerStartDateVisible}
                  mode="date"
                  onConfirm={this.confirmPickerStartDate}
                  onCancel={this.cancelPickerStartDate}
                  date={startDate || this.now}
                  maximumDate={endDate}
                  locale={language}
                  headerTextIOS={formatMessage(messages.pickDate)}
                  cancelTextIOS={formatMessage(messages.cancel)}
                  confirmTextIOS={formatMessage(messages.confirm)}
                />
              </View>

              {/*Ngay nhap canh*/}
              <View style={styles.itemContainer}>
                <TextInfo
                  styleContainer={styles.itemTitle}
                  text={formatMessage(messages.endDay)}
                  star
                />
                <Text style={styles.date} onPress={this.showPickerEndDate}>
                  {endDateString}
                </Text>
                <DateTimePickerModal
                  isVisible={isPickerEndDateVisible}
                  mode="date"
                  onConfirm={this.confirmPickerEndDate}
                  onCancel={this.cancelPickerEndDate}
                  date={endDate || this.now}
                  minimumDate={startDate}
                  locale={language}
                  headerTextIOS={formatMessage(messages.pickDate)}
                  cancelTextIOS={formatMessage(messages.cancel)}
                  confirmTextIOS={formatMessage(messages.confirm)}
                />
              </View>

              {/*Dia diem khoi hanh*/}
              <View>
                <TextInfo
                  styleContainer={[styles.itemTitle, {paddingTop: 10}]}
                  text={formatMessage(messages.startPlace)}
                />
                <View style={styles.item2Container}>
                  <TextInfo
                    styleContainer={styles.headerTwoContainer}
                    style={styles.headerTwo}
                    text={formatMessage(messages.country)}
                    star
                  />
                  <SelectPicker
                    enableSearch={true}
                    data={countries}
                    loading={!countries}
                    value={startCountryID}
                    content={startCountryName}
                    headerText={formatMessage(messages.selectCountry)}
                    placeholder={formatMessage(messages.select)}
                    onVisible={this.onVisiblePickerCountry}
                    onSelect={this.onSelectStartCountry}
                  />
                </View>
                <View style={styles.item2Container}>
                  <TextInfo
                    styleContainer={styles.headerTwoContainer}
                    style={styles.headerTwo}
                    text={formatMessage(messages.province)}
                    star
                  />
                  {startVN ? (
                    <SelectPicker
                      enableSearch={true}
                      data={provinces}
                      loading={!provinces}
                      value={startProvinceID}
                      content={startProvinceName}
                      headerText={formatMessage(messages.selectProvince)}
                      placeholder={formatMessage(messages.select)}
                      onVisible={this.onVisiblePickerProvince}
                      onSelect={this.onSelectStartProvince}
                    />
                  ) : (
                    <TextInput
                      style={styles.textInput}
                      onChangeText={this.onStartProvinceInputChange}
                      value={startProvince}
                      onBlur={this.saveFormState}
                    />
                  )}
                </View>
              </View>

              {/*Dia diem noi den*/}
              <View>
                <TextInfo
                  styleContainer={[styles.itemTitle, {paddingTop: 10}]}
                  text={formatMessage(messages.endPlace)}
                />

                <View style={styles.item2Container}>
                  <TextInfo
                    styleContainer={styles.headerTwoContainer}
                    style={styles.headerTwo}
                    text={formatMessage(messages.country)}
                    star
                  />
                  <View style={styles.labelVietNam}>
                    <Text>{formatMessage(messages.vietnam)}</Text>
                  </View>
                </View>

                <View style={styles.item2Container}>
                  <TextInfo
                    styleContainer={styles.headerTwoContainer}
                    style={styles.headerTwo}
                    text={formatMessage(messages.province)}
                    star
                  />
                  <SelectPicker
                    enableSearch={true}
                    data={provinces}
                    loading={!provinces}
                    value={endProvinceID}
                    content={endProvinceName}
                    headerText={formatMessage(messages.selectProvince)}
                    placeholder={formatMessage(messages.select)}
                    onVisible={this.onVisiblePickerProvince}
                    onSelect={this.onSelectEndProvince}
                  />
                </View>
                <FormInput
                  title={formatMessage(messages.country21Day)}
                  textStyle={styles.headerTwo}
                  onChangeText={this.onCountry21DayInputChange}
                  onBlur={this.saveFormState}
                  value={country21Day}
                  star
                />
              </View>

              {/*Dia chi luu tru sau khi cach ly*/}
              <View>
                <TextInfo
                  styleContainer={[styles.itemTitle, {paddingTop: 10}]}
                  text={formatMessage(messages.afterQuarantinePlace)}
                />

                <View style={styles.item2Container}>
                  <TextInfo
                    styleContainer={styles.headerTwoContainer}
                    style={styles.headerTwo}
                    text={formatMessage(messages.vnProvince)}
                  />
                  <SelectPicker
                    enableSearch={true}
                    data={provinces}
                    loading={!provinces}
                    value={afterQuarantine_ProvinceID}
                    content={afterQuarantine_ProvinceName}
                    headerText={formatMessage(messages.vnSelectProvince)}
                    placeholder={formatMessage(messages.select)}
                    onVisible={this.onVisiblePickerProvince}
                    onSelect={this.onSelectAfterQuarantineProvince}
                  />
                </View>

                <View style={styles.item2Container}>
                  <TextInfo
                    styleContainer={styles.headerTwoContainer}
                    style={styles.headerTwo}
                    text={formatMessage(messages.vnDistrict)}
                  />
                  <SelectPicker
                    enableSearch={true}
                    data={afterQuarantine_Districts}
                    loading={!afterQuarantine_Districts}
                    value={afterQuarantine_DistrictID}
                    content={afterQuarantine_DistrictName}
                    headerText={formatMessage(messages.vnSelectDistrict)}
                    placeholder={formatMessage(messages.select)}
                    onSelect={this.onSelectAfterQuarantinePDistrict}
                    onVisible={this.onVisiblePickerAfterQuarantineDistrict}
                    shouldVisible={this.shouldVisibleAfterQuarantineDistrict}
                  />
                </View>

                <View style={styles.item2Container}>
                  <TextInfo
                    styleContainer={styles.headerTwoContainer}
                    style={styles.headerTwo}
                    text={formatMessage(messages.vnWard)}
                  />
                  <SelectPicker
                    enableSearch={true}
                    data={afterQuarantine_Ward}
                    loading={!afterQuarantine_Ward}
                    value={afterQuarantine_WardID}
                    content={afterQuarantine_WardName}
                    headerText={formatMessage(messages.vnSelectWard)}
                    placeholder={formatMessage(messages.select)}
                    onSelect={this.onSelectAfterQuarantineWard}
                    onVisible={this.onVisiblePickerAfterQuarantineWard}
                    shouldVisible={this.shouldVisibleAfterQuarantineWard}
                  />
                </View>

                <FormInput
                  title={formatMessage(messages.afterQuarantineAddress)}
                  textStyle={styles.headerTwo}
                  containerStyle={styles.headerTwoContainer}
                  onChangeText={this.onAfterQuarantineAddressInputChange}
                  onBlur={this.saveFormState}
                  value={afterQuarantine_Address}
                />
              </View>

              {/*Dia chi lien lac tai viet nam*/}
              <View>
                <TextInfo
                  styleContainer={[styles.itemTitle, {paddingTop: 10}]}
                  text={formatMessage(messages.vnContactAddress)}
                />

                <View style={styles.item2Container}>
                  <TextInfo
                    styleContainer={styles.headerTwoContainer}
                    style={styles.headerTwo}
                    text={formatMessage(messages.vnProvince)}
                    star
                  />
                  <SelectPicker
                    enableSearch={true}
                    data={provinces}
                    loading={!provinces}
                    value={vn_ProvinceID}
                    content={vn_ProvinceName}
                    headerText={formatMessage(messages.vnSelectProvince)}
                    placeholder={formatMessage(messages.select)}
                    onVisible={this.onVisiblePickerProvince}
                    onSelect={this.onSelectVNProvince}
                  />
                </View>

                <View style={styles.item2Container}>
                  <TextInfo
                    styleContainer={styles.headerTwoContainer}
                    style={styles.headerTwo}
                    text={formatMessage(messages.vnDistrict)}
                    star
                  />
                  <SelectPicker
                    enableSearch={true}
                    data={vn_Districts}
                    loading={!vn_Districts}
                    value={vn_DistrictID}
                    content={vn_DistrictName}
                    headerText={formatMessage(messages.vnSelectDistrict)}
                    placeholder={formatMessage(messages.select)}
                    onSelect={this.onSelectVNPDistrict}
                    onVisible={this.onVisiblePickerVNDistrict}
                    shouldVisible={this.shouldVisibleVNDistrict}
                  />
                </View>

                <View style={styles.item2Container}>
                  <TextInfo
                    styleContainer={styles.headerTwoContainer}
                    style={styles.headerTwo}
                    text={formatMessage(messages.vnWard)}
                    star
                  />
                  <SelectPicker
                    enableSearch={true}
                    data={vn_Ward}
                    loading={!vn_Ward}
                    value={vn_WardID}
                    content={vn_WardName}
                    headerText={formatMessage(messages.vnSelectWard)}
                    placeholder={formatMessage(messages.select)}
                    onSelect={this.onSelectVNWard}
                    onVisible={this.onVisiblePickerVNWard}
                    shouldVisible={this.shouldVisibleVNWard}
                  />
                </View>

                <FormInput
                  title={formatMessage(messages.vnAddress)}
                  textStyle={styles.headerTwo}
                  containerStyle={styles.headerTwoContainer}
                  onChangeText={this.onVNAddressInputChange}
                  onBlur={this.saveFormState}
                  value={vn_Address}
                  star
                />

                <FormInput
                  title={formatMessage(messages.phoneNumber)}
                  textStyle={styles.headerTwo}
                  containerStyle={styles.headerTwoContainer}
                  onChangeText={this.onNumberPhoneInputChange}
                  onBlur={this.saveFormState}
                  keyboardType={'phone-pad'}
                  star
                  value={numberPhone}
                />

                <FormInput
                  title={formatMessage(messages.email)}
                  textStyle={styles.headerTwo}
                  containerStyle={styles.headerTwoContainer}
                  onChangeText={this.onEmailInputChange}
                  onBlur={this.onEmailInputBlur}
                  value={email}
                />
              </View>

              {/*Trieu chung trong 21 ngay*/}
              <View style={styles.itemContainer}>
                <TextInfo
                  styleContainer={styles.itemTitle}
                  text={formatMessage(messages.symptom21Day)}
                  star
                />
                <View style={{paddingBottom: 10}}>
                  <View style={styles.rowSymptom0}>
                    <MediumText style={styles.nameSymptom}>
                      {formatMessage(messages.symptom)}
                    </MediumText>
                    <MediumText style={styles.text1}>
                      {formatMessage(messages.yes)}
                    </MediumText>
                    <MediumText style={styles.text1}>
                      {formatMessage(messages.no)}
                    </MediumText>
                  </View>

                  {symptomData.map((symptomItem, index) => (
                    <View
                      key={symptomItem.id}
                      style={
                        index % 2 === 0
                          ? styles.rowSymptom1
                          : styles.rowSymptom2
                      }>
                      <Text style={styles.nameSymptom}>
                        {vietnamese ? symptomItem.name : symptomItem.nameEn}
                        <Text style={styles.star}> *</Text>
                      </Text>
                      <TouchableOpacity
                        style={styles.checkboxSymptom}
                        activeOpacity={1}
                        onPress={() =>
                          this.onSelectSymptom(symptomItem.id, true)
                        }>
                        <RadioButton
                          checked={symptom[symptomItem.id] === true}
                          onPress={() =>
                            this.onSelectSymptom(symptomItem.id, true)
                          }
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.checkboxSymptom}
                        activeOpacity={1}
                        onPress={() =>
                          this.onSelectSymptom(symptomItem.id, false)
                        }>
                        <RadioButton
                          checked={symptom[symptomItem.id] === false}
                          onPress={() =>
                            this.onSelectSymptom(symptomItem.id, false)
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <FormInput
                  textStyle={styles.headerTwo}
                  containerStyle={{
                    paddingTop: 0,
                    paddingBottom: 0,
                  }}
                  title={formatMessage(messages.vacxinContent)}
                  onChangeText={this.onVacXinInputChange}
                  onBlur={this.saveFormState}
                  value={vacxin}
                />
              </View>

              {/*Lich su phoi nhiem trong 21 ngay*/}
              <View style={styles.itemContainer}>
                <TextInfo
                  styleContainer={styles.itemTitle}
                  text={formatMessage(messages.exposureHistory21Day)}
                  star
                />
                <View>
                  <View style={styles.rowSymptom0}>
                    <MediumText style={styles.nameSymptom} />
                    <MediumText style={styles.buttonSymptom}>
                      {formatMessage(messages.yes)}
                    </MediumText>
                    <MediumText style={styles.buttonSymptom}>
                      {formatMessage(messages.no)}
                    </MediumText>
                  </View>

                  {exposureHistoryData.map(exposureItem => (
                    <View key={exposureItem.id} style={styles.rowSymptom1}>
                      <Text style={styles.nameSymptom}>
                        {vietnamese ? exposureItem.name : exposureItem.nameEn}
                        <Text style={styles.star}> *</Text>
                      </Text>
                      <TouchableOpacity
                        style={styles.checkboxSymptom}
                        activeOpacity={1}
                        onPress={() =>
                          this.onSelectExposureHistory(exposureItem.id, true)
                        }>
                        <RadioButton
                          checked={exposureHistory[exposureItem.id] === true}
                          onPress={() =>
                            this.onSelectExposureHistory(exposureItem.id, true)
                          }
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.checkboxSymptom}
                        activeOpacity={1}
                        onPress={() =>
                          this.onSelectExposureHistory(exposureItem.id, false)
                        }>
                        <RadioButton
                          checked={exposureHistory[exposureItem.id] === false}
                          onPress={() =>
                            this.onSelectExposureHistory(exposureItem.id, false)
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              {/*Co so cach ly*/}
              <View style={styles.itemContainer}>
                <TextInfo
                  styleContainer={styles.itemTitle}
                  text={formatMessage(messages.quarantinePlace)}
                  star
                />
                {quarantinePlaceData.map(item => {
                  return (
                    <CheckBox1
                      key={item.id}
                      title={language === 'vi' ? item.name : item.nameEn}
                      containerStyle={styles.checkboxContainer}
                      textStyle={styles.checkBoxText}
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      activeOpacity={1}
                      size={18}
                      onPress={() => this.onSelectQuarantinePlace(item.id)}
                      checked={item.id === quarantinePlace}
                    />
                  );
                })}

                {quarantinePlace === 'quarantineOther' && (
                  <TextInput
                    style={[styles.textInput]}
                    onChangeText={this.onOtherQuarantinePlaceInputChange}
                    value={otherQuarantinePlace}
                    onBlur={this.saveFormState}
                  />
                )}
              </View>

              {/*Phieu ket qua xet nghiem*/}
              <View>
                <TextInfo
                  styleContainer={styles.itemTitle}
                  text={formatMessage(messages.testResult)}
                />
                <View
                  style={[
                    styles.flexRow,
                    {paddingTop: 8, paddingBottom: 10, alignItems: 'center'},
                  ]}>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={this.onSelectTestResultImage}
                    style={
                      testResultImageBase64 || testResultImageURL
                        ? styles.testResultImageBtn
                        : styles.testResultBtn
                    }>
                    {testResultImageBase64 || testResultImageURL ? (
                      <Image
                        style={styles.testResultImage}
                        source={testResultImageSource}
                      />
                    ) : (
                      <MediumText style={styles.selectImage}>
                        {formatMessage(messages.selectImage)}
                      </MediumText>
                    )}
                  </TouchableOpacity>

                  <View style={{marginLeft: 20}}>
                    <TouchableOpacity
                      style={styles.testResultRow}
                      activeOpacity={1}
                      onPress={() => this.selectTestResult(true)}>
                      <RadioButton
                        checked={testResult === true}
                        onPress={() => this.selectTestResult(true)}
                      />
                      <MediumText style={styles.testResultName}>
                        {formatMessage(messages.negative)}
                      </MediumText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.testResultRow}
                      activeOpacity={1}
                      onPress={() => this.selectTestResult(false)}>
                      <RadioButton
                        checked={testResult === false}
                        onPress={() => this.selectTestResult(false)}
                      />
                      <MediumText style={styles.testResultName}>
                        {formatMessage(messages.positive)}
                      </MediumText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/*Ngay xet nghiem*/}
              <View style={styles.itemContainer}>
                <TextInfo
                  styleContainer={styles.itemTitle}
                  text={formatMessage(messages.testDate)}
                />
                <Text style={styles.date} onPress={this.showPickerTestDate}>
                  {testDateString}
                </Text>
                <DateTimePickerModal
                  isVisible={isPickerTestDateVisible}
                  mode="date"
                  onConfirm={this.confirmPickerTestDate}
                  onCancel={this.cancelPickerTestDate}
                  date={testDate || this.now}
                  locale={language}
                  headerTextIOS={formatMessage(messages.pickDate)}
                  cancelTextIOS={formatMessage(messages.cancel)}
                  confirmTextIOS={formatMessage(messages.confirm)}
                />
              </View>

              <Text style={styles.labelRed}>
                {formatMessage(messages.content3)}
              </Text>

              <View style={styles.btnSendContainer}>
                <TouchableOpacity style={styles.btnSend} onPress={this.onSend}>
                  <Text style={styles.btnSendContent}>
                    {formatMessage(messages.sendContent)}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
        {this.renderAlert()}
      </KeyboardAvoidingView>
    );
  }
}

EntryForm.propTypes = {
  intl: intlShape.isRequired,
  navigation: PropTypes.object,
  route: PropTypes.object,
};

EntryForm.defaultProps = {
  displayHeader: true,
};

export default injectIntl(EntryForm);
