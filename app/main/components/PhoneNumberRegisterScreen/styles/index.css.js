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

import {StyleSheet, Platform} from 'react-native';
import {bigger, huge, large, normal, small} from '../../../../core/fontSize';
import {blue_bluezone} from '../../../../core/color';
import {heightPercentageToDP, widthPercentageToDP} from '../../../../core/utils/dimension';

const BTN_MARGIN_HORIZONTAL = heightPercentageToDP((43 / 720) * 100);
const LOGO_HEIGHT = heightPercentageToDP((124 / 720) * 100);
const LAYOUT_PADDING_TOP = heightPercentageToDP((64 / 720) * 100);
const PADDING_TOP_INPUT = heightPercentageToDP((51 / 720) * 100);
const PADDING_BOTTOM_INPUT = heightPercentageToDP((35 / 720) * 100);
const BOTTOM_PHONE = heightPercentageToDP((50 / 720) * 100);
const BTN_HEIGHT = heightPercentageToDP((46 / 720) * 100);
const INPUT_HEIGHT = heightPercentageToDP((40 / 720) * 100);
const CHECKBOX_IOS_MARGIN_TOP = heightPercentageToDP((17 / 720) * 100);
const CHECKBOX_ANDROID_MARGIN_TOP = heightPercentageToDP((13 / 720) * 100);
const TEXT_INPUT_MARGIN_HORIZONTAL = widthPercentageToDP((30 / 360) * 100);
const CHECKBOX_MARGIN_HORIZONTAL = widthPercentageToDP((23 / 360) * 100);

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: bigger,
  },

  layout1: {
    paddingTop: LAYOUT_PADDING_TOP,
    marginHorizontal: 30,
  },

  logoView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },

  text1: {
    textAlign: 'center',
    fontSize: huge,
    fontStyle: 'normal',
    fontWeight: 'bold',
    color: blue_bluezone,
    marginTop: 15,
  },

  text2: {
    fontSize: normal,
    fontStyle: 'normal',
    lineHeight: 25,
    textAlign: 'center',
  },

  text4: {
    fontSize: normal,
    fontStyle: 'normal',
    lineHeight: 38,
  },

  layout2: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 10,
  },

  text3: {
    fontSize: large,
    lineHeight: 20,
  },

  textInput: {
    height: INPUT_HEIGHT,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    paddingLeft: 16,
    fontSize: normal,
    color: '#000000',
    marginHorizontal: TEXT_INPUT_MARGIN_HORIZONTAL,
  },

  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  keyBoardContainer: {
    height: 500,
  },

  logo: {
    width: 124,
    height: 124,
  },

  phone: {
    marginTop: PADDING_TOP_INPUT,
    marginBottom: PADDING_BOTTOM_INPUT,
  },

  textColorActive: {
    color: blue_bluezone,
  },

  buttonIcon: {
    width: 18,
    height: 18,
  },

  center: {
    margin: 40,
    justifyContent: 'center',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingTop: 19,
  },

  modalContentText01: {
    fontSize: large,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  modalContentText02: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },

  modalFooter: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(60, 60, 67, 0.29)',
    width: '100%',
    flexDirection: 'row',
  },

  buttonContinued: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    height: 45,
  },

  textButtonContinued: {
    fontWeight: 'bold',
    fontSize: large,
    color: blue_bluezone,
  },

  textButtonSkip: {
    fontSize: large,
    color: blue_bluezone,
  },

  borderBtn: {
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
  },

  buttonActive: {
    backgroundColor: blue_bluezone,
  },

  buttonDisable: {
    backgroundColor: '#ccc',
  },

  containerStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: BOTTOM_PHONE,
    alignItems: 'center',
  },

  buttonInvite: {},

  textInvite: {
    fontSize: normal,
    color: blue_bluezone,
  },

  btnNext: {
    marginHorizontal: BTN_MARGIN_HORIZONTAL,
    height: BTN_HEIGHT,
  },

  checkboxContainer: {
    flexDirection: 'row',
    marginTop:
      Platform.OS === 'ios'
        ? CHECKBOX_IOS_MARGIN_TOP
        : CHECKBOX_ANDROID_MARGIN_TOP,
    ...Platform.select({
      ios: {
        marginHorizontal: TEXT_INPUT_MARGIN_HORIZONTAL,
      },
      android: {
        marginHorizontal: CHECKBOX_MARGIN_HORIZONTAL,
      },
    }),
  },

  textCheckBox: {
    flex: 1,
    fontSize: small,
    lineHeight: 24,
    color: '#000000',
    ...Platform.select({
      ios: {
        paddingLeft: 10,
        marginTop: -4,
      },
      android: {
        paddingRight: 7,
      }
    }),
  },

  textCheckbox2: {
    fontWeight: 'bold',
    color: blue_bluezone,
    fontFamily: 'OpenSans-Semibold',
  },

  checkbox: {
    fontSize: 14,
    ...Platform.select({
      ios: {
        width: 15,
        height: 15,
      },
    }),
  },
});

export {LOGO_HEIGHT};

export default styles;
