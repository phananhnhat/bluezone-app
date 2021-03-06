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

import {StyleSheet} from 'react-native';
import * as fontSize from '../../../../core/fontSize';
import {blue_bluezone} from '../../../../core/color';
import {heightPercentageToDP} from '../../../../core/utils/dimension';

const BTN_HEIGHT = heightPercentageToDP((46 / 720) * 100);
const INPUT_HEIGHT = heightPercentageToDP((40 / 720) * 100);
const TITLE_PADDING_TOP = heightPercentageToDP((35 / 720) * 100);
const TITLE_PADDING_BOTTOM = heightPercentageToDP((100 / 720) * 100);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  scroll: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  buttonConfirm: {
    marginHorizontal: 43,
    marginBottom: 30,
    paddingBottom: 30,
  },
  colorButtonConfirm: {
    backgroundColor: blue_bluezone,
    height: BTN_HEIGHT,
  },

  btnConfim: {
    backgroundColor: '#e8e8e8',
    height: BTN_HEIGHT,
  },

  inputOTPMax: {
    height: INPUT_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    fontSize: fontSize.large,
    marginBottom: 51,
    marginHorizontal: 30,
    textAlign: 'center',
    paddingTop: 9,
    paddingBottom: 9,
    color: '#000000',
  },

  labelSendHistory: {
    color: '#000000',
    fontSize: fontSize.normal,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingTop: TITLE_PADDING_TOP,
    paddingBottom: TITLE_PADDING_BOTTOM,
    lineHeight: 25,
  },

  modalFooter: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(60, 60, 67, 0.29)',
    width: '100%',
    flexDirection: 'row',
  },
});

export default styles;
