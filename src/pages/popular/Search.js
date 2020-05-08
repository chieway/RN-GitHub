import React, {PureComponent, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  DeviceEventEmitter,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import RepositoryService, {TYPE} from '../../services/RepositoryService';
import FavoriteService from '../../services/FavoriteService';
import {checkFavorite} from '../../utils/utils';
import PopularRepo from '../../components/PopularRepo';
import {ThemeContext, useTheme} from '../../context/themeContext';

const searchService = new RepositoryService();
const favoriteService = new FavoriteService(TYPE.Popular);

const Search = () => {
  const navigationOptions = ({navigation, screenProps}) => {
    return {
      title: '搜索',
      headerStyle: {
        backgroundColor: screenProps.theme,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    };
  };
  const [dataSource, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');
  const theme = useTheme();
  const favoriteKeys = [];
  const data = [];

  useEffect(() => {
    const {navigation} = this.props;
    const {theme} = this.context;
    navigation.setParams({theme});
  }, []);

  const flushFavoriteState = () => {
    const items = data;
    const favoriteKeys = favoriteKeys;
    const dataSource = items.map((item) => {
      return {
        ...item,
        isFavorite: checkFavorite(item, favoriteKeys),
      };
    });
    setData(dataSource);
    setLoading(false);
  };

  const getFavoriteKeys = () => {
    favoriteService
      .getFavoriteKeys()
      .then((keys) => {
        if (keys) {
          favoriteKeys = keys;
        }
        flushFavoriteState();
      })
      .catch((err) => {
        console.warn(err);
        flushFavoriteState();
      });
  };

  const handleSearch = () => {
    setLoading(true);
    searchService
      .searchData(value)
      .then((res) => {
        data = res.items;
        getFavoriteKeys();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const renderRow = ({item}) => {
    return (
      <PopularRepo data={item} onFavorite={handleFavorite} theme={theme} />
    );
  };

  const handleFavorite = (item, isFavorite) => {
    if (isFavorite) {
      favoriteService.saveFavoriteItem(
        item.id.toString(),
        JSON.stringify(item),
        this.handleSearch,
      );
    } else {
      favoriteService.removeFavoriteItem(item.id.toString(), this.loadData);
    }
  };

  const _keyExtractor = (item, index) => item.id + '';

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <TextInput
          style={[styles.input, {borderColor: theme}]}
          autoFoucs
          value={value}
          onChangeText={(value) => this.setState({value})}
        />
        <TouchableOpacity
          style={[styles.title, {backgroundColor: theme}]}
          onPress={handleSearch}>
          <Text style={styles.text}>搜索</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size={'large'}
            animating={loading}
            style={styles.loading}
          />
        ) : (
          <FlatList
            refreshing={loading}
            onRefresh={handleSearch}
            keyExtractor={_keyExtractor}
            data={dataSource}
            renderItem={renderRow}
          />
        )}
      </View>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    flex: 1,
    marginLeft: 10,
    borderRadius: 2,
  },
  title: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    paddingLeft: 10,
    paddingRight: 10,
    height: 40,
    borderRadius: 2,
  },
  text: {
    fontSize: 14,
    color: '#FFF',
  },
  search: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 45,
    marginRight: 10,
  },
});