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
import {ScrollView, SafeAreaView, Dimensions, Linking} from 'react-native';
import {injectIntl, intlShape} from 'react-intl';
import HTML from 'react-native-render-html';
import 'moment/locale/vi'; // without this line it didn't work

// Api
import {getNews} from '../../../core/apis/bluezone';

// Components
import Header from '../../../base/components/Header';

// Styles
import {CUSTOM_STYLES} from './styles/index.css';
import configuration from '../../../configuration';
import {reportScreenAnalytics} from '../../../core/analytics';
import SCREEN from '../../nameScreen';
import * as fontSize from '../../../core/fontSize';

class DetailNewScreen extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      news: {},
    };
  }

  componentDidMount() {
    const {route} = this.props;
    const item = route.params?.item;
    const data = item?.data;
    this.BzNewId = data?.BzNewId;
    getNews(
      this.BzNewId,
      data => {
        this.setState({
          news: data?.BzEntry?.[this.BzNewId],
        });
      },
      this.getNewFail,
    );

    reportScreenAnalytics(SCREEN.DETAIL_NEW);
  }

  getNewFail(repponse) {}

  onLinkPress = (e, url) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      }
    });
  };

  render() {
    const {news} = this.state;
    const {route} = this.props;
    const item = (route && route.params.item) || {};
    const {Language} = configuration;
    //
    const title =
      (Language === 'vi' ? item.title : item.titleEn) ||
      item.title ||
      item.titleEn;

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
        <Header
          colorIcon={'#000000'}
          styleTitle={{paddingHorizontal: 50, color: '#000000', fontSize: fontSize.fontSize19}}
          title={title}
        />
        <ScrollView contentContainerStyle={{paddingTop: 12}}>
          <HTML
            onLinkPress={this.onLinkPress}
            html={news?.data?.content}
            tagsStyles={CUSTOM_STYLES}
            imagesMaxWidth={Dimensions.get('window').width - 40}
            allowFontScaling={false}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }
}

DetailNewScreen.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DetailNewScreen);
