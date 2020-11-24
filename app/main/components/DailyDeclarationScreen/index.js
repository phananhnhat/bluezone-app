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

import React from 'react';
import {StatusBar, SafeAreaView, View, ScrollView, Alert} from 'react-native';
import {injectIntl, intlShape} from 'react-intl';
import * as PropTypes from 'prop-types';

// Components
import Text, {MediumText} from '../../../base/components/Text';
import Header from '../../../base/components/Header';
import ButtonBase from '../../../base/components/ButtonBase';
import HealthMonitoringItem from './components/HealthMonitoringItem';
import CheckBox from '../../../base/components/CheckBox';

// Apis
import {
  InsertEntryPersonReport,
  GetListDailyDeclaration,
} from '../../../core/apis/bluezone';

// Core
import {
  getInforEntryPersonObjectGuid,
  getEntryObjectGUIDInformation,
  setHealthMonitoring,
  getHealthMonitoring,
  setTimeHealthMonitoring,
  getTimeHealthMonitoring,
} from '../../../core/storage';
import {reportScreenAnalytics} from '../../../core/analytics';
import SCREEN from '../../nameScreen';
import {clearScheduleDeclareDailyHealthToday} from '../../../core/notifyScheduler';

// Styles
import styles from './styles/index.css';
import message from '../../../core/msg/dailyDeclaration';
import {ButtonConfirm} from '../../../base/components/ButtonText/ButtonModal';
import ModalBase from '../../../base/components/ModalBase';

import {listSymptomData} from './data';

let LtinforEntryPersonReportDetail = [
  {
    StateID: 1,
    Value: false,
  },
  {
    StateID: 2,
    Value: false,
  },
  {
    StateID: 3,
    Value: false,
  },
  {
    StateID: 4,
    Value: false,
  },
  {
    StateID: 5,
    Value: false,
  },
];

class DailyDeclaration extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isVisibleError: false,
      isVisibleSuccess: false,
      isVisibleSendError: false,
      itemsSelected: [],
      data: [],
    };

    this.selectItem = this.selectItem.bind(this);
    this.onSendInfo = this.onSendInfo.bind(this);
    this.checkDisabledCheckbox = this.checkDisabledCheckbox.bind(this);
    this.getLtinforEntryPersonReportDetail = this.getLtinforEntryPersonReportDetail.bind(
      this,
    );
    this.InsertEntryPersonReportSuccess = this.InsertEntryPersonReportSuccess.bind(
      this,
    );
    this.InsertEntryPersonReportError = this.InsertEntryPersonReportError.bind(
      this,
    );
    this.getListHealthMonitoring = this.getListHealthMonitoring.bind(this);
    this.renderModal = this.renderModal.bind(this);
    this.onCloseAlertError = this.onCloseAlertError.bind(this);
    this.formatDate = this.formatDate.bind(this);
  }

  componentDidMount() {
    reportScreenAnalytics(SCREEN.DAILY_DECLARATION);
    this.getListHealthMonitoring();
  }

  async getListHealthMonitoring() {
    const HealthMonitoring = await getHealthMonitoring();
    if (!HealthMonitoring) {
      const InforEntryPersonObjectGuid = await getInforEntryPersonObjectGuid();
      GetListDailyDeclaration(InforEntryPersonObjectGuid, response => {
        const Object = response.Object;
        const data = Object.reverse().map(item => {
          let ListItem = [];
          item.LtinforEntryPersonReportDetail.map(
            id => id.Value && ListItem.push(id.StateID),
          );
          return {
            CreateDate: item.CreateDate,
            ListItem: ListItem,
          };
        });

        this.setState({data: data});
      });
    } else {
      this.setState({data: HealthMonitoring});
    }
  }

  selectItem(item) {
    const {itemsSelected} = this.state;
    const i = itemsSelected.indexOf(item.StateID);
    if (i !== -1) {
      itemsSelected.splice(i, 1);
    } else {
      itemsSelected.push(item.StateID);
    }
    this.setState({itemsSelected: [...itemsSelected]});
  }

  getLtinforEntryPersonReportDetail(ListItem) {
    LtinforEntryPersonReportDetail = LtinforEntryPersonReportDetail.map(item =>
      ListItem.includes(item.StateID)
        ? {
            StateID: item.StateID,
            Value: true,
          }
        : {
            StateID: item.StateID,
            Value: false,
          },
    );
    return LtinforEntryPersonReportDetail;
  }

  formatDate(CreateDate) {
    const date = new Date(CreateDate);
    const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    const month =
      date.getMonth() > 8 ? date.getMonth() + 1 : `0${date.getMonth()}`;
    return `${day}/${month}/${date.getFullYear()}`;
  }

  async onSendInfo() {
    const {intl} = this.props;
    const {formatMessage} = intl;
    let {itemsSelected} = this.state;

    const TimeHealthMonitoring = await getTimeHealthMonitoring();
    if (
      TimeHealthMonitoring &&
      this.formatDate(TimeHealthMonitoring) === this.formatDate(new Date())
    ) {
      this.setState({isVisibleSendError: true});
      return;
    }

    const ListItem = itemsSelected.length > 0 ? itemsSelected : [5];

    const InforEntryObjectGuid = await getEntryObjectGUIDInformation();
    const InforEntryPersonObjectGuid = await getInforEntryPersonObjectGuid();

    if (!InforEntryObjectGuid || !InforEntryPersonObjectGuid) {
      Alert.alert('Bluezone', formatMessage(message.error1));
      return;
    }

    const LtinforEntryPersonReportDetail = this.getLtinforEntryPersonReportDetail(
      ListItem,
    );

    const body = {
      InforEntryPersonReport: {
        InforEntryObjectGuid: InforEntryObjectGuid,
        InforEntryPersonObjectGuid: InforEntryPersonObjectGuid,
        LtinforEntryPersonReportDetail: LtinforEntryPersonReportDetail,
      },
    };

    InsertEntryPersonReport(
      body,
      this.InsertEntryPersonReportSuccess,
      this.InsertEntryPersonReportError,
    );
  }

  InsertEntryPersonReportSuccess(response) {
    let {itemsSelected, data} = this.state;
    const ListItem = itemsSelected.length > 0 ? itemsSelected : [5];
    const object = {
      CreateDate: response.Object.CreateDate,
      ListItem: ListItem,
    };
    data.splice(0, 0, object);

    this.setState({
      data: data,
      itemsSelected: [],
      isVisibleSuccess: true,
    });

    setHealthMonitoring(data);
    setTimeHealthMonitoring(new Date().getTime());

    // Xử lý phần thông báo khai báo hàng ngày. Ngày hôm nay sẽ ko thông báo nữa.
    clearScheduleDeclareDailyHealthToday();
  }

  InsertEntryPersonReportError(error) {
    this.setState({isVisibleError: true});
  }

  checkDisabledCheckbox(StateID) {
    const {itemsSelected} = this.state;
    if (
      (itemsSelected.length > 0 && itemsSelected[0] === 5 && StateID !== 5) ||
      (itemsSelected.length > 0 && itemsSelected[0] !== 5 && StateID === 5)
    ) {
      return true;
    }
    return false;
  }

  onCloseAlertError() {
    this.setState({
      isVisibleError: false,
      isVisibleSuccess: false,
      isVisibleSendError: false,
    });
  }

  renderModal() {
    const {intl} = this.props;
    const {
      isProcessing,
      isVisibleError,
      isVisibleSuccess,
      isVisibleSendError,
    } = this.state;
    const {formatMessage} = intl;
    return (
      <>
        <ModalBase
          isVisibleModal={isVisibleError}
          title={formatMessage(message.titleModal)}
          description={formatMessage(message.describeModal)}>
          <View style={styles.modalFooter}>
            <ButtonConfirm
              text={formatMessage(message.btnCloseModal)}
              onPress={this.onCloseAlertError}
            />
          </View>
        </ModalBase>
        <ModalBase
          isVisibleModal={isVisibleSuccess}
          title={formatMessage(message.titleModal)}
          description={formatMessage(message.describeSuccessModal)}>
          <View style={styles.modalFooter}>
            <ButtonConfirm
              text={formatMessage(message.btnAgreeModal)}
              onPress={this.onCloseAlertError}
            />
          </View>
        </ModalBase>

        <ModalBase
          isVisibleModal={isVisibleSendError}
          title={formatMessage(message.titleModal)}
          description={formatMessage(message.declared)}>
          <View style={styles.modalFooter}>
            <ButtonConfirm
              text={formatMessage(message.btnAgreeModal)}
              onPress={this.onCloseAlertError}
            />
          </View>
        </ModalBase>
      </>
    );
  }

  render() {
    const {intl, route, displayHeader} = this.props;
    const {itemsSelected, data} = this.state;

    const {formatMessage, locale} = intl;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden={true} />
        {displayHeader && <Header title={route?.params?.title} />}
        <ScrollView contentContainerStyle={styles.contentContainerStyle}>
          <MediumText style={styles.title}>
            {formatMessage(message.option)}
          </MediumText>
          <View style={styles.listCheckbox}>
            {listSymptomData.map(item => {
              const selected = !!itemsSelected.find(i => i === item.StateID);
              const name = locale === 'vi' ? item.name : item.nameEn;
              return (
                <CheckBox
                  key={item.StateID}
                  iconRight
                  title={name}
                  disabled={this.checkDisabledCheckbox(item.StateID)}
                  checked={selected}
                  onPress={() => this.selectItem(item)}
                  containerStyle={styles.containerStyleCheckbox}
                  textStyle={{
                    marginRight: 10,
                    marginLeft: 0,
                    color: this.checkDisabledCheckbox(item.StateID)
                      ? '#C5C5C5'
                      : '#000',
                  }}
                />
              );
            })}
          </View>

          <ButtonBase
            title={formatMessage(message.btnSendInfo)}
            onPress={this.onSendInfo}
            containerStyle={styles.containerStyle}
            titleStyle={styles.textInvite}
          />

          {data.length > 0 ? (
            <MediumText style={styles.title}>
              {formatMessage(message.trackHistory)}
            </MediumText>
          ) : null}

          <View>
            {data.map((item, index) => (
              <HealthMonitoringItem item={item} key={index} />
            ))}
          </View>
        </ScrollView>
        {this.renderModal()}
      </SafeAreaView>
    );
  }
}

DailyDeclaration.propTypes = {
  intl: intlShape.isRequired,
};

DailyDeclaration.defaultProps = {
  displayHeader: true,
};

export default injectIntl(DailyDeclaration);
