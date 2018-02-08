import React from 'react';
import ErrorPage from 'components/ErrorPage';
import NavBar from 'containers/NavBar';
import ChannelClaimsDisplay from 'containers/ChannelClaimsDisplay';

import { CHANNEL } from 'constants/show_request_types';

function requestIsAChannelRequest ({ requestType }) {
  return requestType === CHANNEL;
}

function requestIsNewRequest (nextProps, props) {
  return (nextProps.requestId !== props.requestId);
}

class ShowChannel extends React.Component {
  componentDidMount () {
    const {requestId, requestChannelName, requestChannelId, requestList, channelList} = this.props;
    const existingRequest = requestList[requestId];
    if (existingRequest) {
      this.onRepeatChannelRequest(existingRequest, channelList);
    } else {
      this.onNewChannelRequest(requestId, requestChannelName, requestChannelId);
    }
  }
  componentWillReceiveProps (nextProps) {
    if (requestIsAChannelRequest(nextProps) && requestIsNewRequest(nextProps, this.props)) {
      const {requestId, requestChannelName, requestChannelId, requestList, channelList} = nextProps;
      const existingRequest = requestList[requestId];
      if (existingRequest) {
        this.onRepeatChannelRequest(existingRequest, channelList);
      } else {
        this.onNewChannelRequest(requestId, requestChannelName, requestChannelId);
      }
    } else {
      console.log('ShowChannel receiving new props -> request.id did not update', nextProps);
    };
  }
  onNewChannelRequest (requestId, requestName, requestChannelId) {
    console.log('new request');
    this.props.onNewChannelRequest(requestId, requestName, requestChannelId);
  }
  onRepeatChannelRequest ({ error, channelData }, channelList) {
    // if error, return and update state with error
    if (error) {
      return this.props.onRequestError(error);
    }
    // check if the channel data is present or not
    const channelRecordId = `c#${channelData.name}#${channelData.longId}`;
    const existingChannel = channelList[channelRecordId];
    if (existingChannel) {
      this.showExistingChannel(existingChannel);
    } else {
      this.showNewChannel(channelRecordId, channelData);
    }
  }
  showNewChannel (channelRecordId, channelData) {
    this.props.onShowNewChannel(channelRecordId, channelData);
  };
  showExistingChannel (existingChannel) {
    console.log('showExistingChannel:', existingChannel);
    const { error, channelData: {name, shortId, longId}, claimsData } = existingChannel;
    this.props.onShowExistingChannel(error, name, shortId, longId, claimsData);
  };
  componentWillUnmount () {
    console.log('ShowChannel will unmount');
    this.props.onShowChannelClear();
  }
  render () {
    const { error, name, longId, shortId } = this.props;
    if (error) {
      return (
        <ErrorPage error={error}/>
      );
    };
    return (
      <div>
        <NavBar/>
        <div className="row row--tall row--padded">
          <div className="column column--10">
            <h2>channel name: {name ? name : 'loading...'}</h2>
            <p className={'fine-print'}>full channel id: {longId ? longId : 'loading...'}</p>
            <p className={'fine-print'}>short channel id: {shortId ? shortId : 'loading...'}</p>
          </div>
          <div className="column column--10">
            {(name && longId) && <ChannelClaimsDisplay />}
          </div>
        </div>
      </div>
    );
  }
};

export default ShowChannel;
