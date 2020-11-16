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
import * as fontSize from '../../../../../../core/fontSize';
import {heightPercentageToDP} from '../../../../../../core/utils/dimension';

const TEXT_CONTENT_LINEHEIGHT = heightPercentageToDP((22 / 720) * 100);
const BTN_HEIGHT = heightPercentageToDP((40 / 720) * 100);
const TEXT_DES_MARGIN_TOP = heightPercentageToDP((32 / 720) * 100);
const TEXT_DES_MARGIN_BOTTOM = heightPercentageToDP((36 / 720) * 100);

const styles = StyleSheet.create({
  modalBase: {
    margin: 20,
    justifyContent: 'center',
  },

  textDiv: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },

  textTitle: {
    fontSize: fontSize.larger,
    textAlign: 'center',
    fontWeight: '600',
    color: '#1C74C4',
  },

  buttonCancel: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#c6c6c8',
    borderRadius: 0,
  },

  modal: {
    margin: 40,
    justifyContent: 'center',
  },

  textCenter: {
    textAlign: 'center',
  },

  textCenterIOS: {
    textAlign: 'center',
    fontSize: fontSize.larger,
  },

  flex: {
    flex: 1,
  },

  flexRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#c6c6c8',
  },

  colorText: {
    color: '#1C74C4',
  },

  buttonConfirm: {
    borderTopWidth: 0.65,
    borderTopColor: '#c6c6c8',
    height: BTN_HEIGHT,
    borderRadius: 0,
  },

  textButtonConfirm: {
    color: '#1C74C4',
    fontSize: fontSize.fontSize14,
    fontWeight: '600',
  },

  titleContent: {
    fontSize: fontSize.larger,
    textAlign: 'center',
    lineHeight: TEXT_CONTENT_LINEHEIGHT,
    color: '#015cd0',
    marginTop: 15,
    paddingVertical: 5,
  },

  textContent: {
    fontSize: fontSize.fontSize14,
    textAlign: 'center',
    lineHeight: TEXT_CONTENT_LINEHEIGHT,
    color: '#313131',
    marginTop: 15,
    marginBottom: 15,
    paddingVertical: 5,
  },

  textBtn: {
    fontSize: fontSize.fontSize16,
    textAlign: 'center',
    paddingHorizontal: 12,
    color: '#015cd0',
    lineHeight: 20,
  },
});

export default styles;