import { VocabWord } from '../types';

export const THEMATIC_VOCAB: Record<string, VocabWord[]> = {
  animals: [
    {
      word: 'Panda',
      phonetic: '/ˈpændə/',
      pos: 'n.',
      meaning: '熊猫',
      definition: 'A large black-and-white bear-like animal that lives in bamboo forests.',
      exampleEn: 'The cute panda is eating green bamboo and climbing a tree.',
      exampleZh: '这只可爱的大熊猫正在吃绿色的竹子并爬树。'
    },
    {
      word: 'Lion',
      phonetic: '/ˈlaɪən/',
      pos: 'n.',
      meaning: '狮子',
      definition: 'A large wild cat with golden fur. The king of the jungle!',
      exampleEn: 'Look at the strong lion! It says ROAR!',
      exampleZh: '看那只强壮的狮子！它在嗷呜嗷呜大叫！'
    },
    {
      word: 'Rabbit',
      phonetic: '/ˈræbɪt/',
      pos: 'n.',
      meaning: '小兔子',
      definition: 'A small animal with long ears and a fluffy tail that loves to hop.',
      exampleEn: 'The white rabbit has long ears and hops in the grass.',
      exampleZh: '那只白色的兔子长着长长的耳朵，在草地上蹦蹦跳跳。'
    },
    {
      word: 'Monkey',
      phonetic: '/ˈmʌŋki/',
      pos: 'n.',
      meaning: '小猴子',
      definition: 'A clever animal with a long tail that loves climbing trees and eating bananas.',
      exampleEn: 'The silly monkey is swinging from tree to tree.',
      exampleZh: '那只淘气的小猴子正在树林里荡来荡去。'
    },
    {
      word: 'Elephant',
      phonetic: '/ˈelɪfənt/',
      pos: 'n.',
      meaning: '大象',
      definition: 'A very large gray animal with big ears, a long trunk, and white tusks.',
      exampleEn: 'The big elephant uses its long nose to drink water.',
      exampleZh: '这只大象用它长长的鼻子来喝水。'
    }
  ],
  colors: [
    {
      word: 'Rainbow',
      phonetic: '/ˈreɪnboʊ/',
      pos: 'n.',
      meaning: '彩虹',
      definition: 'A beautiful arch of many colors in the sky when the sun shines through rain.',
      exampleEn: 'Look at the beautiful rainbow in the sky after the rain!',
      exampleZh: '快看下雨后天空中那道美丽的彩虹！'
    },
    {
      word: 'Pink',
      phonetic: '/pɪŋk/',
      pos: 'adj. / n.',
      meaning: '粉红色',
      definition: 'A warm, sweet color made by mixing red and white. Like strawberries!',
      exampleEn: 'The little girl is wearing a beautiful pink dress today.',
      exampleZh: '这个小女孩今天穿着一件漂亮的粉色连衣裙。'
    },
    {
      word: 'Star',
      phonetic: '/stɑːr/',
      pos: 'n.',
      meaning: '星星 / 星形',
      definition: 'A bright point in the night sky, or a shape with five points.',
      exampleEn: 'Twinkle, twinkle, little star, how I wonder what you are!',
      exampleZh: '一闪一闪亮晶晶，满天都是小星星！'
    },
    {
      word: 'Balloon',
      phonetic: '/bəˈluːn/',
      pos: 'n.',
      meaning: '气球',
      definition: 'A bright, colorful toy bag filled with air that floats in the sky.',
      exampleEn: 'My dad bought me a big red balloon that floats in the air.',
      exampleZh: '爸爸给我买了一个能在空中飘浮的红色大气球。'
    },
    {
      word: 'Gold',
      phonetic: '/ɡoʊld/',
      pos: 'adj. / n.',
      meaning: '金色 / 黄金',
      definition: 'A shiny yellow color, like a golden crown or a treasure.',
      exampleEn: 'The magical wizard is wearing a shiny gold hat.',
      exampleZh: '神奇的魔法师正戴着一顶闪闪发光的金色帽子。'
    }
  ],
  foods: [
    {
      word: 'Ice cream',
      phonetic: '/ˈaɪs ˌkriːm/',
      pos: 'n.',
      meaning: '冰淇淋',
      definition: 'A sweet, cold food made from milk and sugar, eaten as a treat.',
      exampleEn: 'I love eating cold strawberry ice cream on a hot day.',
      exampleZh: '我喜欢在炎热的天气里吃冰凉的草莓冰淇淋。'
    },
    {
      word: 'Cookie',
      phonetic: '/ˈkʊki/',
      pos: 'n.',
      meaning: '小曲奇饼干',
      definition: 'A sweet, baked biscuit, often containing chocolate chips.',
      exampleEn: 'Grandma made delicious chocolate chip cookies for me.',
      exampleZh: '奶奶给我烤了美味的巧克力碎曲奇饼干。'
    },
    {
      word: 'Apple',
      phonetic: '/ˈæpl/',
      pos: 'n.',
      meaning: '苹果',
      definition: 'A sweet, round, crunchy fruit that can be red, green, or yellow.',
      exampleEn: 'An apple a day keeps the doctor away!',
      exampleZh: '一天一苹果，医生远离我！'
    },
    {
      word: 'Pizza',
      phonetic: '/ˈpiːtsə/',
      pos: 'n.',
      meaning: '披萨',
      definition: 'A flat, round bread topped with tomato sauce, cheese, and meats.',
      exampleEn: 'Let\'s share a big cheese pizza for dinner tonight!',
      exampleZh: '我们今天晚饭一起分享一个大号芝士披萨吧！'
    },
    {
      word: 'Honey',
      phonetic: '/ˈhʌni/',
      pos: 'n.',
      meaning: '蜂蜜',
      definition: 'A sweet, sticky yellow liquid made by bees.',
      exampleEn: 'Teddy Bear loves to eat sweet honey with a spoon.',
      exampleZh: '泰迪熊喜欢用勺子吃甜甜的蜂蜜。'
    }
  ]
};
