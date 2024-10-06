import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TouchableOpacity } from 'react-native';
import { Feather, FontAwesome6, Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { TextInput } from 'react-native';
import Categories from '../../components/categories';
import { apiCall } from '../../api';
import ImageGrid from '../../components/imageGrid';
import { debounce, set } from 'lodash';
import FiltersModal from '../../components/filtersModal';
import { useRouter } from 'expo-router';

var page = 1;

const HomeScreen = () => {

    const { top } = useSafeAreaInsets();
    const paddingTop = top > 0 ? top + 10 : 30;
    const [search, setSearch] = React.useState('');
    const [images, setImages] = React.useState([]);
    const [filters, setFilters] = React.useState(null);
    const [activeCategory, setActiveCategory] = React.useState(null);
    const [isEndReached, setIsEndReached] = React.useState(false);
    const searchInputRef = React.useRef(null);
    const modalRef = React.useRef(null);
    const scrollRef = React.useRef(null);
    const router = useRouter();

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async (params = { page: 1 }, append = true) => {
        let res = await apiCall(params);
        if (res.success && res?.data?.hits) {
            if (append) {
                setImages([...images, ...res.data.hits])
            } else {
                setImages([...res.data.hits])
            }
        }
    }

    const openFiltersModal = () => {
        modalRef?.current?.present();
    }

    const closeFiltersModal = () => {
        modalRef?.current?.close();
    }

    const applyFilters = () => {
        if (filters) {
            page = 1;
            setImages([]);
            let params = {
                page,
                ...filters
            }
            if (activeCategory) params.category = activeCategory;
            if (search) params.q = search;
            fetchImages(params, false);
        }
        closeFiltersModal();
    }

    const resetFilters = () => {
        if (filters) {
            page = 1;
            setFilters(null);
            setImages([]);
            let params = {
                page,
            }
            if (activeCategory) params.category = activeCategory;
            if (search) params.q = search;
            fetchImages(params, false);
        }
        closeFiltersModal();
    }

    const clearThisFilter = (filterName) => {
        let filterz = { ...filters };
        delete filterz[filterName];
        setFilters({...filterz});
        page = 1;
        setImages([]);
        let params = {
            page,
            ...filterz
        }
        if (activeCategory) params.category = activeCategory;
        if (search) params.q = search;
        fetchImages(params, false);
    }

    const handleChangeCategory = (cat) => {
        setActiveCategory(cat);
        clearSearch();
        setImages([]);
        page = 1;
        let params = {
            page,
            ...filters
        }
        if (cat) params.category = cat;
        fetchImages(params, false);
    }

    const handleSearch = (text) => {
        setSearch(text);
        if (text.length > 2) {
            page = 1;
            setImages([]);
            setActiveCategory(null);
            fetchImages({ page, q: text, ...filters }, false);
        }
        if (text == "") {
            page = 1;
            searchInputRef?.current.clear();
            setImages([]);
            setActiveCategory(null);
            fetchImages({ page, ...filters }, false);
        }
    }

    const clearSearch = () => {
        setSearch('');

    }

    const handleScroll = (event) => {
        const contentHeight = event.nativeEvent.contentSize.height;
        const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
        const scrollOffset = event.nativeEvent.contentOffset.y;
        const bottomPosition = contentHeight - scrollViewHeight;

        if (scrollOffset >= bottomPosition - 1) {
            if (!isEndReached) {
                setIsEndReached(true);
                console.log('Reached bottom');
                // Fetch more images
                ++page;
                let params = {
                    page,
                    ...filters
                }
                if (activeCategory) params.category = activeCategory;
                if (search) params.q = search;
                fetchImages(params);
            }
        } else if (isEndReached) {
            setIsEndReached(false);
        }
    }

    const handleScrollUp = () => {
        scrollRef?.current?.scrollTo({
            y: 0,
            animated: true
        })
    }

    const handleTextDebounce = useCallback(debounce(handleSearch, 400), []);

    return (
        <View style={[styles.container, { paddingTop }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleScrollUp}
                >
                    <Text style={styles.title}>
                        BigWalP
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openFiltersModal}>
                    <FontAwesome6 name='bars-staggered' size={22} color={theme.colors.neutral(0.7)} />
                </TouchableOpacity>
            </View>
            <ScrollView
                onScroll={handleScroll}
                scrollEventThrottle={5}
                ref={scrollRef}
                contentContainerStyle={{
                    gap: 15,
                }}
            >
                {/* Search Bar*/}
                <View style={styles.searchBar}>
                    <View style={styles.searchIcon}>
                        <Feather name='search' size={24} color={theme.colors.neutral(0.4)} />
                    </View>
                    <TextInput
                        placeholder='Search for wallpapers'
                        //value={search}
                        ref={searchInputRef}
                        style={styles.searchInput}
                        onChangeText={handleTextDebounce}
                    />
                    {
                        search && (
                            <TouchableOpacity onPress={() => handleSearch("")} style={styles.closeIcon}>
                                <Ionicons name='close' size={24} color={theme.colors.neutral(0.6)} />
                            </TouchableOpacity>
                        )
                    }
                </View>
                {/* Categories */}
                <View style={styles.categories}>
                    <Categories activeCategory={activeCategory} handleChangeCategory={handleChangeCategory} />
                </View>
                {/* Applied filter */}
                {
                    filters && (
                        <View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.appliedFilters}
                            >
                                {
                                    Object.keys(filters).map((key, index) => {
                                        return (
                                            <View
                                                key={key}
                                                style={styles.filterItem}
                                            >
                                                {
                                                    key == 'colors' ? (
                                                        <View style={{
                                                            height: 20,
                                                            width: 30,
                                                            borderRadius: 7,
                                                            backgroundColor: filters[key]
                                                        }}></View>
                                                    ) : (
                                                <Text style={styles.filterItemText}>
                                                    {filters[key]}
                                                </Text>
                                                )
                                            }
                                                <Pressable
                                                    style={styles.filterCloseIcon}
                                                    onPress={() => clearThisFilter(key)}
                                                >
                                                    <Ionicons name='close' size={14} color={theme.colors.neutral(0.9)} />
                                                </Pressable>
                                            </View>
                                        )
                                    })
                                }
                            </ScrollView>
                        </View>
                    )
                }
                {/* Images Grid */}
                <View>
                    {
                        images.length > 0 && <ImageGrid images={images} router={router} />
                    }
                </View>
                {/* Loading */}
                <View style={{
                    marginBottom: 70,
                    marginTop: images.length > 0 ? 10 : 70
                }}>
                    <ActivityIndicator size="large" />
                </View>
            </ScrollView>
            {/* Filters Modal*/}
            <FiltersModal
                modalRef={modalRef}
                filters={filters}
                setFilters={setFilters}
                onClear={closeFiltersModal}
                onApply={applyFilters}
                onReset={resetFilters}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 15
    },
    header: {
        marginHorizontal: wp(4),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: hp(4),
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.neutral(0.9)
    },
    searchBar: {
        marginHorizontal: wp(4),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.grayBG,
        backgroundColor: theme.colors.white,
        padding: 6,
        paddingLeft: 10,
        borderRadius: theme.radius.lg
    },
    searchIcon: {
        padding: 8,
    },
    searchInput: {
        flex: 1,
        borderRadius: theme.radius.sm,
        paddingVertical: 10,
        fontSize: hp(1.8),
    },
    closeIcon: {
        backgroundColor: theme.colors.neutral(0.1),
        padding: 8,
        borderRadius: theme.radius.sm,
    },
    appliedFilters: {
        paddingHorizontal: wp(4),
        gap: 10,
    },
    filterItem: {
        backgroundColor: theme.colors.grayBG,
        padding: 3,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.radius.xs,
        padding: 8,
        gap: 10,
        paddingHorizontal: 10
    },
    filterItemText: {
        fontSize: hp(1.9),
    },
    filterCloseIcon: {
        backgroundColor: theme.colors.neutral(0.2),
        padding: 4,
        borderRadius: 7,
    },
})

export default HomeScreen